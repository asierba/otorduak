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

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const PANTRY_SET = new Set(pantryStaples.map((s) => stripAccents(s.toLowerCase())))

const GROCERY_STORAGE_KEY = 'otorduak-grocery-checked'

interface GroceryListProps {
  weekPlan: WeekPlan
  frozenMealNames?: Set<string>
  onBack?: () => void
}

function getCheckedItems(): Record<string, number> {
  try {
    const stored = localStorage.getItem(GROCERY_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        const migrated: Record<string, number> = {}
        for (const item of parsed) migrated[item] = 99
        return migrated
      }
      return parsed
    }
  } catch {
    // ignore parse errors
  }
  return {}
}

function saveCheckedItems(items: Record<string, number>) {
  localStorage.setItem(GROCERY_STORAGE_KEY, JSON.stringify(items))
}

function getTotalCount(quantityDisplay: string): number {
  const match = quantityDisplay.match(/^x(\d+)$/)
  return match ? parseInt(match[1]) : 1
}

function getRemainingDisplay(quantityDisplay: string, checkedCount: number): string {
  if (checkedCount === 0) return quantityDisplay
  const match = quantityDisplay.match(/^x(\d+)$/)
  if (!match) return quantityDisplay
  const remaining = parseInt(match[1]) - checkedCount
  if (remaining <= 1) return ''
  return `x${remaining}`
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

type ViewMode = 'department' | 'meal'

export function GroceryList({ weekPlan, frozenMealNames, onBack }: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, number>>(getCheckedItems)
  const [copiedDept, setCopiedDept] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('department')

  const toggleCollapse = useCallback((key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
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
      if (meal && !frozenMealNames?.has(meal.name)) {
        for (const ingredient of meal.ingredients) {
          const normalized = ingredient.name.toLowerCase()
          if (PANTRY_SET.has(stripAccents(normalized))) continue
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

  // Build meal groups: group ingredients by meal name
  const mealGroups: [string, IngredientEntry[]][] = (() => {
    const groups = new Map<string, Map<string, { quantities: (string | number | undefined)[] }>>()
    for (const day of DAYS) {
      const dayPlan = weekPlan[day as DayName]
      for (const mealType of ['lunch', 'dinner'] as const) {
        const meal = dayPlan[mealType]
        if (meal && !frozenMealNames?.has(meal.name) && meal.ingredients.length > 0) {
          if (!groups.has(meal.name)) {
            groups.set(meal.name, new Map())
          }
          const mealIngredients = groups.get(meal.name)!
          for (const ingredient of meal.ingredients) {
            const normalized = ingredient.name.toLowerCase()
            if (PANTRY_SET.has(stripAccents(normalized))) continue
            if (!mealIngredients.has(normalized)) {
              mealIngredients.set(normalized, { quantities: [] })
            }
            mealIngredients.get(normalized)!.quantities.push(ingredient.quantity)
          }
        }
      }
    }
    const result: [string, IngredientEntry[]][] = []
    for (const [mealName, ingredients] of groups) {
      const entries: IngredientEntry[] = []
      for (const [ingName, { quantities }] of ingredients) {
        entries.push([ingName, [mealName], aggregateQuantities(quantities)])
      }
      entries.sort((a, b) => a[0].localeCompare(b[0], 'es'))
      result.push([mealName, entries])
    }
    result.sort((a, b) => a[0].localeCompare(b[0], 'es'))
    return result
  })()

  const activeGroups: [string, IngredientEntry[]][] = viewMode === 'department' ? departmentGroups : mealGroups
  const totalCount = ingredientMap.size
  const allCollapsed = activeGroups.length > 0 && collapsed.size === activeGroups.length

  const toggleCollapseAll = useCallback(() => {
    setCollapsed((prev) => {
      if (prev.size === activeGroups.length) return new Set()
      return new Set(activeGroups.map(([d]) => d))
    })
  }, [activeGroups])

  const toggleItem = (ingredient: string, totalCount: number) => {
    setCheckedItems((prev) => {
      const next = { ...prev }
      const current = next[ingredient] ?? 0
      if (current >= totalCount) {
        delete next[ingredient]
      } else {
        next[ingredient] = current + 1
      }
      return next
    })
  }

  const clearAll = () => {
    setCheckedItems({})
  }

  const copyDeptToTrello = (dept: string, entries: IngredientEntry[]) => {
    const unchecked = entries.filter(([ing, , qd]) => (checkedItems[ing] ?? 0) < getTotalCount(qd))
    if (unchecked.length === 0) return
    const lines = unchecked.map(([ing, , qd]) => {
      const remaining = getRemainingDisplay(qd, checkedItems[ing] ?? 0)
      return ingredientToText(ing, remaining)
    })
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedDept(dept)
      setTimeout(() => setCopiedDept(null), 2000)
    })
  }

  const isFullyChecked = (ing: string, qd: string) => (checkedItems[ing] ?? 0) >= getTotalCount(qd)

  const checkedCount = [...ingredientMap.entries()].filter(([ing, { quantityDisplay }]) =>
    isFullyChecked(ing, quantityDisplay)
  ).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Back to planner"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Grocery List
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {checkedCount}/{totalCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <button
                onClick={toggleCollapseAll}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
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

        {totalCount > 0 && (
          <div className="flex justify-center px-4 pt-3">
            <div className="inline-flex rounded-lg bg-gray-200 dark:bg-gray-700 p-0.5">
              <button
                type="button"
                onClick={() => { setViewMode('department'); setCollapsed(new Set()) }}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'department' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                By department
              </button>
              <button
                type="button"
                onClick={() => { setViewMode('meal'); setCollapsed(new Set()) }}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'meal' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                By meal
              </button>
            </div>
          </div>
        )}

        {handwrittenMeals.length > 0 && (
          <div className="mx-4 mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-3 py-2">
            <p className="text-sm text-amber-800 dark:text-amber-300">
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
            <p className="text-center text-gray-400 dark:text-gray-500 py-8">
              No meals in the plan yet.
            </p>
          ) : (
            activeGroups.map(([groupKey, entries]) => {
              const isCollapsed = collapsed.has(groupKey)
              const groupChecked = entries.filter(([ing, , qd]) => isFullyChecked(ing, qd)).length
              const allGroupChecked = groupChecked === entries.length
              const groupUncheckedCount = entries.length - groupChecked
              const isCopied = copiedDept === groupKey
              const groupLabel = viewMode === 'department'
                ? DEPARTMENT_LABELS[groupKey as DepartmentKey]
                : groupKey
              return (
                <div key={groupKey} className="mb-4">
                  <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wide border-b border-gray-100 dark:border-gray-700 pb-1 mb-1 ${allGroupChecked ? 'line-through text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                    <button
                      type="button"
                      onClick={() => toggleCollapse(groupKey)}
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
                      {groupLabel}
                    </button>
                    <div className="flex items-center gap-2 font-normal normal-case">
                      <span className="text-gray-400 dark:text-gray-500">
                        {groupChecked}/{entries.length}
                      </span>
                      {groupUncheckedCount > 0 && (
                        <button
                          type="button"
                          onClick={() => copyDeptToTrello(groupKey as DepartmentKey, entries)}
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
                        const totalCount = getTotalCount(quantityDisplay)
                        const checkedN = checkedItems[ingredient] ?? 0
                        const fullyChecked = checkedN >= totalCount
                        const partiallyChecked = checkedN > 0 && !fullyChecked
                        const remainingDisplay = getRemainingDisplay(quantityDisplay, checkedN)
                        return (
                          <li key={ingredient}>
                            <label className="flex items-start gap-3 py-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={fullyChecked}
                                onChange={() => toggleItem(ingredient, totalCount)}
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <span
                                  className={
                                    fullyChecked
                                      ? 'line-through text-gray-400 dark:text-gray-500'
                                      : 'text-gray-900 dark:text-gray-100'
                                  }
                                >
                                  {ingredient.charAt(0).toUpperCase() +
                                    ingredient.slice(1)}
                                  {remainingDisplay && (
                                    <>
                                      {' '}
                                      <span className={fullyChecked ? '' : 'text-gray-500 dark:text-gray-400'}>
                                        {remainingDisplay}
                                      </span>
                                    </>
                                  )}
                                  {partiallyChecked && (
                                    <>
                                      {' '}
                                      <span className="text-xs text-green-600 dark:text-green-400">
                                        ({checkedN} at home)
                                      </span>
                                    </>
                                  )}
                                </span>
                                <span className="block text-xs text-gray-400 dark:text-gray-500 truncate">
                                  {viewMode === 'department' ? meals.join(', ') : DEPARTMENT_LABELS[getDepartment(ingredient)]}
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
