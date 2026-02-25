import { useState } from 'react'
import type { Meal, ColorScheme } from '../../types'

interface MealPickerSheetProps {
  meals: Meal[]
  selectedMeals: Meal[]
  onToggle: (meal: Meal) => void
  onClose: () => void
  title: string
  colorScheme: ColorScheme
}

export function MealPickerSheet({
  meals,
  selectedMeals,
  onToggle,
  onClose,
  title,
  colorScheme,
}: MealPickerSheetProps) {
  const [search, setSearch] = useState('')
  const selectedNames = new Set(selectedMeals.map(m => m.name))
  const filtered = meals.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl max-h-[70vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meals..."
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto flex-1 pb-8">
          {filtered.map(m => (
            <button
              key={m.name}
              onClick={() => onToggle(m)}
              className={`w-full px-4 py-3 text-left text-sm border-b border-gray-50 dark:border-gray-700 flex items-center justify-between ${
                selectedNames.has(m.name)
                  ? `${colorScheme.selected} font-medium`
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{m.name}</span>
              {selectedNames.has(m.name) && <span>{colorScheme.selectedEmoji}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
