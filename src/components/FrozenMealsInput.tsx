import { useState } from 'react'
import type { Meal } from '../types'

interface FrozenMealsInputProps {
  meals: Meal[]
  frozenMeals: Meal[]
  onChange: (meals: Meal[]) => void
}

export function FrozenMealsInput({ meals, frozenMeals, onChange }: FrozenMealsInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const frozenNames = new Set(frozenMeals.map(m => m.name))

  const filtered = meals.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleMeal = (meal: Meal) => {
    if (frozenNames.has(meal.name)) {
      onChange(frozenMeals.filter(m => m.name !== meal.name))
    } else {
      onChange([...frozenMeals, meal])
    }
  }

  const removeMeal = (name: string) => {
    onChange(frozenMeals.filter(m => m.name !== name))
  }

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
        >
          🧊 Frozen meals
          {frozenMeals.length > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {frozenMeals.length}
            </span>
          )}
        </button>
        {frozenMeals.map(m => (
          <span
            key={m.name}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-sky-50 text-sky-800 border border-sky-200 rounded-full"
          >
            🧊 {m.name}
            <button
              onClick={() => removeMeal(m.name)}
              className="text-sky-400 hover:text-sky-700 ml-0.5"
              aria-label={`Remove ${m.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { setIsOpen(false); setSearch('') }}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-2">Select frozen meals</p>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search meals..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1 pb-8">
              {filtered.map(m => (
                <button
                  key={m.name}
                  onClick={() => toggleMeal(m)}
                  className={`w-full px-4 py-3 text-left text-sm border-b border-gray-50 flex items-center justify-between ${
                    frozenNames.has(m.name)
                      ? 'bg-sky-50 text-sky-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{m.name}</span>
                  {frozenNames.has(m.name) && <span>🧊</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
