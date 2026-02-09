import { useState } from 'react'
import type { Meal } from '../types'

interface ColorScheme {
  button: string
  badge: string
  chip: string
  chipRemove: string
  selected: string
  selectedEmoji: string
}

interface PreSelectedMealsInputProps {
  meals: Meal[]
  selectedMeals: Meal[]
  onChange: (meals: Meal[]) => void
  label: string
  emoji: string
  chipEmoji?: string
  colorScheme: ColorScheme
}

export function PreSelectedMealsInput({
  meals,
  selectedMeals,
  onChange,
  label,
  emoji,
  chipEmoji,
  colorScheme,
}: PreSelectedMealsInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedNames = new Set(selectedMeals.map(m => m.name))

  const filtered = meals.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleMeal = (meal: Meal) => {
    if (selectedNames.has(meal.name)) {
      onChange(selectedMeals.filter(m => m.name !== meal.name))
    } else {
      onChange([...selectedMeals, meal])
    }
  }

  const removeMeal = (name: string) => {
    onChange(selectedMeals.filter(m => m.name !== name))
  }

  return (
    <div>
      <div>
        <button
          onClick={() => setIsOpen(true)}
          className={`px-3 py-1.5 text-sm border rounded-lg transition-colors flex items-center gap-1 ${colorScheme.button}`}
        >
          {emoji} {label}
          {selectedMeals.length > 0 && (
            <span className={`text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${colorScheme.badge}`}>
              {selectedMeals.length}
            </span>
          )}
        </button>
        {selectedMeals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto">
            {selectedMeals.map(m => (
              <span
                key={m.name}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-full ${colorScheme.chip}`}
              >
                {chipEmoji && `${chipEmoji} `}{m.name}
                <button
                  onClick={() => removeMeal(m.name)}
                  className={`ml-0.5 ${colorScheme.chipRemove}`}
                  aria-label={`Remove ${m.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
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
              <p className="text-sm font-medium text-gray-700 mb-2">Select {label.toLowerCase()}</p>
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
                    selectedNames.has(m.name)
                      ? `${colorScheme.selected} font-medium`
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{m.name}</span>
                  {selectedNames.has(m.name) && <span>{colorScheme.selectedEmoji}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
