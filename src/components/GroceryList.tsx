import { useState, useEffect, useCallback } from 'react'
import type { WeekPlan, DayName } from '../types'
import { DAYS } from '../types'
import pantryStaples from '../data/pantry-staples.json'
import {
  DEPARTMENT_ORDER,
  DEPARTMENT_LABELS,
  getDepartment,
  type DepartmentKey,
} from '../data/departments'

const PANTRY_SET = new Set(pantryStaples.map((s) => s.toLowerCase()))

const GROCERY_STORAGE_KEY = 'otorduak-grocery-checked'

interface GroceryListProps {
  weekPlan: WeekPlan
  onBack: () => void
}

function getCheckedItems(): Set<string> {
  try {
    const stored = localStorage.getItem(GROCERY_STORAGE_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
  } catch {
    // ignore parse errors
  }
  return new Set()
}

function saveCheckedItems(items: Set<string>) {
  localStorage.setItem(GROCERY_STORAGE_KEY, JSON.stringify([...items]))
}

function parseQuantity(qty: string | number | undefined): { value: number; unit: string } {
  if (qty === undefined || qty === null) {
    return { value: 1, unit: '' }
  }
  const str = String(qty).trim()
  const match = str.match(/^(\d+(?:\.\d+)?)\s*(.*)$/)
  if (match) {
    return { value: parseFloat(match[1]), unit: match[2].trim() }
  }
  return { value: 1, unit: '' }
}

// Returns an empty string when a unit-less item has quantity 1 (to avoid showing "x1")
function formatQuantityPart(unit: string, total: number): string {
  if (unit === '') {
    return total === 1 ? '' : `x${total}`
  }
  return `${total} ${unit}`
}

function aggregateQuantities(quantities: (string | number | undefined)[]): string {
  const parsed = quantities.map(parseQuantity)
  const units = [...new Set(parsed.map((p) => p.unit))]

  if (units.length === 1) {
    const total = Math.round(parsed.reduce((sum, p) => sum + p.value, 0) * 100) / 100
    return formatQuantityPart(units[0], total)
  }

  return units
    .map((unit) => {
      const group = parsed.filter((p) => p.unit === unit)
      const total = Math.round(group.reduce((sum, p) => sum + p.value, 0) * 100) / 100
      return formatQuantityPart(unit, total)
    })
    .filter(Boolean)
    .join(' + ')
}

type IngredientEntry = [string, string[], string]

function ingredientToText(ing: string, quantityDisplay: string): string {
  const name = ing.charAt(0).toUpperCase() + ing.slice(1)
  return quantityDisplay ? `${name} ${quantityDisplay}` : name
}

function buildDepartmentGroups(
  ingredientMap: Map<string, { meals: string[]; quantityDisplay: string }>
): [DepartmentKey, IngredientEntry[]][] {
  const groups = new Map<DepartmentKey, IngredientEntry[]>()

  for (const [ingredient, { meals, quantityDisplay }] of ingredientMap) {
    const dept = getDepartment(ingredient)
    if (!groups.has(dept)) {
      groups.set(dept, [])
    }
    groups.get(dept)!.push([ingredient, meals, quantityDisplay])
  }

  for (const entries of groups.values()) {
    entries.sort((a, b) => a[0].localeCompare(b[0], 'es'))
  }

  return DEPARTMENT_ORDER.filter((d) => groups.has(d)).map((d) => [
    d,
    groups.get(d)!,
  ])
}

export function GroceryList({ weekPlan, onBack }: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(getCheckedItems)
  const [copiedDept, setCopiedDept] = useState<DepartmentKey | null>(null)
  const [collapsed, setCollapsed] = useState<Set<DepartmentKey>>(new Set())

  const toggleCollapse = useCallback((dept: DepartmentKey) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(dept)) {
        next.delete(dept)
      } else {
        next.add(dept)
      }
      return next
    })
  }, [])

  useEffect(() => {
    saveCheckedItems(checkedItems)
  }, [checkedItems])

  const rawIngredients = new Map<string, { meals: string[]; quantities: (string | number | undefined)[] }>()
  for (const day of DAYS) {
    const dayPlan = weekPlan[day as DayName]
    for (const mealType of ['lunch', 'dinner'] as const) {
      const meal = dayPlan[mealType]
      if (meal) {
        for (const ingredient of meal.ingredients) {
          const normalized = ingredient.name.toLowerCase()
          if (PANTRY_SET.has(normalized)) continue
          if (!rawIngredients.has(normalized)) {
            rawIngredients.set(normalized, { meals: [], quantities: [] })
          }
          const data = rawIngredients.get(normalized)!
          data.meals.push(meal.name)
          data.quantities.push(ingredient.quantity)
        }
      }
    }
  }

  const ingredientMap = new Map<string, { meals: string[]; quantityDisplay: string }>()
  for (const [name, { meals, quantities }] of rawIngredients) {
    ingredientMap.set(name, { meals, quantityDisplay: aggregateQuantities(quantities) })
  }

  const handwrittenMeals: string[] = []
  for (const day of DAYS) {
    const dayPlan = weekPlan[day as DayName]
    for (const mealType of ['lunch', 'dinner'] as const) {
      const meal = dayPlan[mealType]
      if (meal && meal.ingredients.length === 0) {
        handwrittenMeals.push(meal.name)
      }
    }
  }

  const departmentGroups = buildDepartmentGroups(ingredientMap)
  const totalCount = ingredientMap.size
  const allCollapsed = departmentGroups.length > 0 && collapsed.size === departmentGroups.length

  const toggleCollapseAll = useCallback(() => {
    setCollapsed((prev) => {
      if (prev.size === departmentGroups.length) return new Set()
      return new Set(departmentGroups.map(([d]) => d))
    })
  }, [departmentGroups])

  const toggleItem = (ingredient: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(ingredient)) {
        next.delete(ingredient)
      } else {
        next.add(ingredient)
      }
      return next
    })
  }

  const clearAll = () => {
    setCheckedItems(new Set())
  }

  const copyDeptToTrello = (dept: DepartmentKey, entries: IngredientEntry[]) => {
    const unchecked = entries.filter(([ing]) => !checkedItems.has(ing))
    if (unchecked.length === 0) return
    const lines = unchecked.map(([ing, , quantityDisplay]) => ingredientToText(ing, quantityDisplay))
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedDept(dept)
      setTimeout(() => setCopiedDept(null), 2000)
    })
  }

  const checkedCount = [...ingredientMap.keys()].filter((ing) =>
    checkedItems.has(ing)
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1 text-gray-500 hover:text-gray-700"
              aria-label="Back to planner"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Grocery List
            </h1>
            <span className="text-sm text-gray-500">
              {checkedCount}/{totalCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <button
                onClick={toggleCollapseAll}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label={allCollapsed ? 'Expand all' : 'Collapse all'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {allCollapsed ? (
                    <>
                      <path d="m7 10 5 5 5-5" />
                      <path d="m7 5 5 5 5-5" />
                    </>
                  ) : (
                    <>
                      <path d="m7 14 5-5 5 5" />
                      <path d="m7 19 5-5 5 5" />
                    </>
                  )}
                </svg>
              </button>
            )}
            {checkedCount > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {handwrittenMeals.length > 0 && (
          <div className="mx-4 mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Heads up:</span>{' '}
              {handwrittenMeals.length === 1
                ? <><span className="font-medium">{handwrittenMeals[0]}</span> is a custom meal and its ingredients are not included below.</>
                : <>The following custom meals have no ingredients listed: {handwrittenMeals.map((name, i) => (
                    <span key={name}>{i > 0 && ', '}<span className="font-medium">{name}</span></span>
                  ))}.</>
              }
            </p>
          </div>
        )}

        <div className="px-4 py-2">
          {totalCount === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No meals in the plan yet.
            </p>
          ) : (
            departmentGroups.map(([dept, entries]) => {
              const isCollapsed = collapsed.has(dept)
              const deptChecked = entries.filter(([ing]) => checkedItems.has(ing)).length
              const allDeptChecked = deptChecked === entries.length
              const deptUncheckedCount = entries.length - deptChecked
              const isCopied = copiedDept === dept
              return (
                <div key={dept} className="mb-4">
                  <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wide border-b border-gray-100 pb-1 mb-1 ${allDeptChecked ? 'line-through text-gray-300' : 'text-gray-500'}`}>
                    <button
                      type="button"
                      onClick={() => toggleCollapse(dept)}
                      className="flex items-center gap-1 flex-1 text-left"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                      {DEPARTMENT_LABELS[dept]}
                    </button>
                    <div className="flex items-center gap-2 font-normal normal-case">
                      <span className="text-gray-400">
                        {deptChecked}/{entries.length}
                      </span>
                      {deptUncheckedCount > 0 && (
                        <button
                          type="button"
                          onClick={() => copyDeptToTrello(dept, entries)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                  {!isCollapsed && (
                    <ul className="space-y-1">
                      {entries.map(([ingredient, meals, quantityDisplay]) => {
                        const isChecked = checkedItems.has(ingredient)
                        return (
                          <li key={ingredient}>
                            <label className="flex items-start gap-3 py-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleItem(ingredient)}
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <span
                                  className={
                                    isChecked
                                      ? 'line-through text-gray-400'
                                      : 'text-gray-900'
                                  }
                                >
                                  {ingredient.charAt(0).toUpperCase() +
                                    ingredient.slice(1)}
                                  {quantityDisplay && (
                                    <>
                                      {' '}
                                      <span className={isChecked ? '' : 'text-gray-500'}>
                                        {quantityDisplay}
                                      </span>
                                    </>
                                  )}
                                </span>
                                <span className="block text-xs text-gray-400 truncate">
                                  {meals.join(', ')}
                                </span>
                              </div>
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
