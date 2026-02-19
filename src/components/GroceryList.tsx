import { useState, useEffect } from 'react'
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
  onClose: () => void
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

type IngredientEntry = [string, string[]]

function buildDepartmentGroups(
  ingredientMap: Map<string, string[]>
): [DepartmentKey, IngredientEntry[]][] {
  const groups = new Map<DepartmentKey, IngredientEntry[]>()

  for (const [ingredient, meals] of ingredientMap) {
    const dept = getDepartment(ingredient)
    if (!groups.has(dept)) {
      groups.set(dept, [])
    }
    groups.get(dept)!.push([ingredient, meals])
  }

  for (const entries of groups.values()) {
    entries.sort((a, b) => a[0].localeCompare(b[0], 'es'))
  }

  return DEPARTMENT_ORDER.filter((d) => groups.has(d)).map((d) => [
    d,
    groups.get(d)!,
  ])
}

export function GroceryList({ weekPlan, onClose }: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(getCheckedItems)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    saveCheckedItems(checkedItems)
  }, [checkedItems])

  const ingredientMap = new Map<string, string[]>()
  for (const day of DAYS) {
    const dayPlan = weekPlan[day as DayName]
    for (const mealType of ['lunch', 'dinner'] as const) {
      const meal = dayPlan[mealType]
      if (meal) {
        for (const ingredient of meal.ingredients) {
          const normalized = ingredient.name.toLowerCase()
          if (PANTRY_SET.has(normalized)) continue
          if (!ingredientMap.has(normalized)) {
            ingredientMap.set(normalized, [])
          }
          ingredientMap.get(normalized)!.push(meal.name)
        }
      }
    }
  }

  const departmentGroups = buildDepartmentGroups(ingredientMap)
  const totalCount = ingredientMap.size

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

  const copyToTrello = () => {
    const lines: string[] = []
    for (const [dept, entries] of departmentGroups) {
      const unchecked = entries.filter(([ing]) => !checkedItems.has(ing))
      if (unchecked.length === 0) continue
      lines.push(`## ${DEPARTMENT_LABELS[dept]}`)
      for (const [ing] of unchecked) {
        lines.push(ing.charAt(0).toUpperCase() + ing.slice(1))
      }
      lines.push('')
    }
    if (lines.length === 0) return
    navigator.clipboard.writeText(lines.join('\n').trim()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const checkedCount = [...ingredientMap.keys()].filter((ing) =>
    checkedItems.has(ing)
  ).length
  const uncheckedCount = totalCount - checkedCount

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Grocery List
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {checkedCount}/{totalCount}
            </span>
            {checkedCount > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
            {uncheckedCount > 0 && (
              <button
                onClick={copyToTrello}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {copied ? 'Copied!' : '📋 Copy'}
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
              aria-label="Close grocery list"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-2">
          {totalCount === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No meals in the plan yet.
            </p>
          ) : (
            departmentGroups.map(([dept, entries]) => (
              <div key={dept} className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-1 mb-1">
                  {DEPARTMENT_LABELS[dept]}
                </h3>
                <ul className="space-y-1">
                  {entries.map(([ingredient, meals]) => {
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
