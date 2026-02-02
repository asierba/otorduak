import { useState } from 'react'
import type { Meal, DayName, MealType } from '../types'
import { getMealsForSlot } from '../utils/generator'

interface MealSlotProps {
  meal: Meal | null
  day: DayName
  mealType: MealType
  meals: Meal[]
  onSwap: (meal: Meal) => void
  onRegenerate: () => void
  onClear: () => void
}

export function MealSlot({ meal, day, mealType, meals, onSwap, onRegenerate, onClear }: MealSlotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const candidates = getMealsForSlot(meals, day, mealType)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-16 px-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left overflow-hidden"
      >
        {meal ? (
          <span className="line-clamp-2">{meal.name}</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="p-2 border-b border-gray-100 flex gap-1">
              <button
                onClick={() => { onRegenerate(); setIsOpen(false) }}
                className="flex-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                Random
              </button>
              <button
                onClick={() => { onClear(); setIsOpen(false) }}
                className="flex-1 px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
            <div className="py-1">
              {candidates.map(m => (
                <button
                  key={m.id}
                  onClick={() => { onSwap(m); setIsOpen(false) }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                    meal?.id === m.id ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
