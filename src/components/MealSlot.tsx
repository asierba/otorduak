import { useState } from 'react'
import type { Meal, DayName, MealType, WeekPlan } from '../types'
import { DAYS, DAY_FULL_LABELS, getTagEmoji, TAG_EMOJIS } from '../types'
import { getMealsForSlot } from '../utils/generator'
import { getRuleForSlot } from '../data/rules'

interface MealSlotProps {
  meal: Meal | null
  day: DayName
  mealType: MealType
  meals: Meal[]
  weekPlan?: WeekPlan
  isFrozen?: boolean
  isEatingOut?: boolean
  locked?: boolean
  hasThermomixViolation?: boolean
  onSwap: (meal: Meal, frozen?: boolean) => void
  onRegenerate: () => void
  onClear: () => void
  onMoveTo: (toDay: DayName, toMealType: MealType) => void
  onToggleEatingOut: () => void
  onViewDetail?: (meal: Meal) => void
}

export function MealSlot({ meal, day, mealType, meals, weekPlan, isFrozen, isEatingOut, locked, hasThermomixViolation, onSwap, onRegenerate, onClear, onMoveTo, onToggleEatingOut, onViewDetail }: MealSlotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showMoveTargets, setShowMoveTargets] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showFullText, setShowFullText] = useState(false)
  const candidates = getMealsForSlot(meals, day, mealType).sort((a, b) => a.name.localeCompare(b.name))
  const filtered = searchText.trim()
    ? candidates.filter(m => m.name.toLowerCase().includes(searchText.toLowerCase()))
    : candidates

  const handleCustomMeal = () => {
    const trimmed = searchText.trim()
    if (!trimmed) return
    const isFrozenMeal = trimmed.startsWith('*')
    const customMeal: Meal = { name: trimmed, tags: [], ingredients: [] }
    onSwap(customMeal, isFrozenMeal)
    setSearchText('')
    setIsOpen(false)
  }

  const isCustomMeal = meal !== null && meal.ingredients.length === 0
  const canViewDetail = locked && meal && !isCustomMeal && onViewDetail

  const handleClick = () => {
    if (canViewDetail) {
      onViewDetail(meal)
    } else if (locked && meal) {
      setShowFullText(true)
    } else if (!locked) {
      if (isCustomMeal && meal) {
        setSearchText(meal.name)
      }
      setIsOpen(true)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={locked && !canViewDetail && !meal}
        className={`w-full h-16 px-3 text-sm rounded-xl transition-colors text-left overflow-hidden ${
          isEatingOut
            ? locked
              ? 'cursor-pointer bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30'
              : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600'
            : hasThermomixViolation
            ? locked
              ? meal
                ? 'cursor-pointer bg-gray-50 dark:bg-gray-800/80 border-2 border-red-400 dark:border-red-500 hover:bg-gray-100 dark:hover:bg-gray-700/80 active:bg-gray-200 dark:active:bg-gray-700'
                : 'cursor-default bg-gray-100 dark:bg-gray-800/60 border-2 border-red-400 dark:border-red-500 text-gray-400 dark:text-gray-500'
              : 'bg-white dark:bg-gray-800 border-2 border-red-400 dark:border-red-500 hover:border-red-500 dark:hover:border-red-400'
            : locked
              ? meal
                ? 'cursor-pointer bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 active:bg-gray-200 dark:active:bg-gray-700'
                : 'cursor-default bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
              : isCustomMeal
                ? 'bg-amber-50 dark:bg-amber-900/20 border border-dashed border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:border-amber-400 dark:hover:border-amber-600'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        {isEatingOut ? (
          <span className="line-clamp-2 text-orange-700 dark:text-orange-300">
            🍽️ Eating out
          </span>
        ) : meal ? (
          <span className={`line-clamp-2 flex items-start gap-1 ${locked && !meal ? 'text-gray-400 dark:text-gray-500' : locked ? 'text-gray-600 dark:text-gray-300' : 'dark:text-gray-100'}`}>
            <span className="flex-1 line-clamp-2">{isFrozen ? '🧊 ' : ''}{isCustomMeal ? '✏️ ' : ''}{getTagEmoji(meal.tags)} {meal.name}</span>
            {canViewDetail && (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 opacity-40">
                <path d="m9 18 6-6-6-6" />
              </svg>
            )}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">
            {(() => {
              const rule = getRuleForSlot(day, mealType)
              return rule ? `${TAG_EMOJIS[rule.requiredTag] || ''} ---` : '---'
            })()}
          </span>
        )}
      </button>

      {showFullText && meal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowFullText(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative mx-6 max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl">
            <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
              {isFrozen ? '🧊 ' : ''}{isCustomMeal ? '✏️ ' : ''}{getTagEmoji(meal.tags)} {meal.name}
            </p>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { setIsOpen(false); setSearchText(''); setShowMoveTargets(false) }}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3" />
              <div className="flex gap-2">
                <button
                  onClick={() => { onRegenerate(); setIsOpen(false); setShowMoveTargets(false) }}
                  className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Random
                </button>
                {meal && (
                  <button
                    onClick={() => setShowMoveTargets(!showMoveTargets)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg ${
                      showMoveTargets
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                    }`}
                  >
                    Move
                  </button>
                )}
                <button
                  onClick={() => { onClear(); setIsOpen(false); setShowMoveTargets(false) }}
                  className="flex-1 py-2.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Clear
                </button>
                <button
                  onClick={() => { onToggleEatingOut(); setIsOpen(false); setShowMoveTargets(false) }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg ${
                    isEatingOut
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                  }`}
                >
                  🍽️ Out
                </button>
              </div>
              {!showMoveTargets && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCustomMeal() }}
                    placeholder="Search or type a custom meal..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
                    autoFocus
                  />
                  {searchText.trim() && (
                    <button
                      onClick={handleCustomMeal}
                      className="px-3 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                      Add ✏️
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="overflow-y-auto flex-1 pb-8">
              {showMoveTargets ? (
                DAYS.filter(d => d !== day).map(targetDay => {
                  const targetMeal = weekPlan?.[targetDay]?.[mealType] ?? null
                  return (
                    <button
                      key={targetDay}
                      onClick={() => {
                        onMoveTo(targetDay, mealType)
                        setIsOpen(false)
                        setShowMoveTargets(false)
                      }}
                      className="w-full px-4 py-3 text-left border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                      <span className="font-medium">{DAY_FULL_LABELS[targetDay]}</span>
                      <span className="text-gray-400 dark:text-gray-500 ml-2">
                        {targetMeal ? `${getTagEmoji(targetMeal.tags)} ${targetMeal.name}` : '(empty)'}
                      </span>
                    </button>
                  )
                })
              ) : (
                filtered.map(m => (
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
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
