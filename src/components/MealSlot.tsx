import { useState } from 'react'
import type { Meal, DayName, MealType } from '../types'
import { getTagEmoji, TAG_EMOJIS } from '../types'
import { getMealsForSlot } from '../utils/generator'
import { getRuleForSlot } from '../data/rules'

interface MealSlotProps {
  meal: Meal | null
  day: DayName
  mealType: MealType
  meals: Meal[]
  isFrozen?: boolean
  onSwap: (meal: Meal) => void
  onRegenerate: () => void
  onClear: () => void
}

export function MealSlot({ meal, day, mealType, meals, isFrozen, onSwap, onRegenerate, onClear }: MealSlotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customText, setCustomText] = useState('')
  const candidates = getMealsForSlot(meals, day, mealType)

  const handleCustomMeal = () => {
    const trimmed = customText.trim()
    if (!trimmed) return
    const customMeal: Meal = { name: trimmed, tags: [], ingredients: [] }
    onSwap(customMeal)
    setCustomText('')
    setIsOpen(false)
  }

  const isCustomMeal = meal !== null && meal.ingredients.length === 0

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full h-16 px-3 text-sm rounded-xl transition-colors text-left overflow-hidden ${
          isCustomMeal
            ? 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        {meal ? (
          <span className="line-clamp-2 dark:text-gray-100">{isFrozen ? '🧊 ' : ''}{getTagEmoji(meal.tags)} {meal.name}</span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">
            {(() => {
              const rule = getRuleForSlot(day, mealType)
              return rule ? `${TAG_EMOJIS[rule.requiredTag] || ''} ---` : '---'
            })()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3" />
              <div className="flex gap-2">
                <button
                  onClick={() => { onRegenerate(); setIsOpen(false) }}
                  className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Random
                </button>
                <button
                  onClick={() => { onClear(); setIsOpen(false) }}
                  className="flex-1 py-2.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCustomMeal() }}
                  placeholder="Type a custom meal..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
                />
                <button
                  onClick={handleCustomMeal}
                  disabled={!customText.trim()}
                  className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 pb-8">
              {candidates.map(m => (
                <button
                  key={m.name}
                  onClick={() => { onSwap(m); setIsOpen(false) }}
                  className={`w-full px-4 py-3 text-left border-b border-gray-50 dark:border-gray-700 ${
                    meal?.name === m.name
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {getTagEmoji(m.tags)} {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
