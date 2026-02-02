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
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-16 px-3 text-sm bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-left overflow-hidden"
      >
        {meal ? (
          <span className="line-clamp-2">{meal.name}</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
              <div className="flex gap-2">
                <button
                  onClick={() => { onRegenerate(); setIsOpen(false) }}
                  className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Random
                </button>
                <button
                  onClick={() => { onClear(); setIsOpen(false) }}
                  className="flex-1 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 pb-8">
              {candidates.map(m => (
                <button
                  key={m.id}
                  onClick={() => { onSwap(m); setIsOpen(false) }}
                  className={`w-full px-4 py-3 text-left border-b border-gray-50 ${
                    meal?.id === m.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
