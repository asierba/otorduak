import { useMemo } from 'react'
import type { Meal, WeekPlan, DayName, MealType } from '../types'
import { DAY_LABELS, getOrderedDays } from '../types'
import { MealSlot } from './MealSlot'
import { getThermomixViolations } from '../utils/generator'

interface WeekGridProps {
  weekPlan: WeekPlan | null
  meals: Meal[]
  weekStartDay: DayName
  frozenMealNames: Set<string>
  eatingOutSlots: Set<string>
  locked: boolean
  onToggleLock: () => void
  onSwap: (day: DayName, mealType: MealType, meal: Meal, frozen?: boolean) => void
  onRegenerate: (day: DayName, mealType: MealType) => void
  onClear: (day: DayName, mealType: MealType) => void
  onMoveTo: (fromDay: DayName, fromMealType: MealType, toDay: DayName, toMealType: MealType) => void
  onToggleEatingOut: (day: DayName, mealType: MealType) => void
  onViewDetail?: (meal: Meal) => void
}

const LockClosedIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const LockOpenIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
)

export function WeekGrid({ weekPlan, meals, weekStartDay, frozenMealNames, eatingOutSlots, locked, onToggleLock, onSwap, onRegenerate, onClear, onMoveTo, onToggleEatingOut, onViewDetail }: WeekGridProps) {
  const orderedDays = getOrderedDays(weekStartDay)
  const thermomixViolations = useMemo(
    () => weekPlan ? getThermomixViolations(weekPlan) : new Set<string>(),
    [weekPlan]
  )

  return (
    <div className="space-y-2">
      <div className="flex justify-end mb-1">
        <button
          onClick={onToggleLock}
          className={`p-1.5 rounded-lg transition-colors ${
            locked
              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label={locked ? 'Unlock meal plan' : 'Lock meal plan'}
        >
          {locked ? LockClosedIcon : LockOpenIcon}
        </button>
      </div>
      <div className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
        <div></div>
        <div className="text-center">Lunch</div>
        <div className="text-center">Dinner</div>
      </div>

      {orderedDays.map(day => (
        <div key={day} className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 items-center">
          <div className="font-bold text-sm text-gray-700 dark:text-gray-300">
            {DAY_LABELS[day]}
          </div>
          <MealSlot
            meal={weekPlan?.[day].lunch ?? null}
            day={day}
            mealType="lunch"
            meals={meals}
            weekPlan={weekPlan ?? undefined}
            isFrozen={!!(weekPlan?.[day].lunch && frozenMealNames.has(weekPlan[day].lunch!.name))}
            isEatingOut={eatingOutSlots.has(`${day}:lunch`)}
            locked={locked}
            hasThermomixViolation={thermomixViolations.has(`${day}:lunch`)}
            onSwap={(meal, frozen) => onSwap(day, 'lunch', meal, frozen)}
            onRegenerate={() => onRegenerate(day, 'lunch')}
            onClear={() => onClear(day, 'lunch')}
            onMoveTo={(toDay, toMealType) => onMoveTo(day, 'lunch', toDay, toMealType)}
            onToggleEatingOut={() => onToggleEatingOut(day, 'lunch')}
            onViewDetail={onViewDetail}
          />
          <MealSlot
            meal={weekPlan?.[day].dinner ?? null}
            day={day}
            mealType="dinner"
            meals={meals}
            weekPlan={weekPlan ?? undefined}
            isFrozen={!!(weekPlan?.[day].dinner && frozenMealNames.has(weekPlan[day].dinner!.name))}
            isEatingOut={eatingOutSlots.has(`${day}:dinner`)}
            locked={locked}
            hasThermomixViolation={thermomixViolations.has(`${day}:dinner`)}
            onSwap={(meal, frozen) => onSwap(day, 'dinner', meal, frozen)}
            onRegenerate={() => onRegenerate(day, 'dinner')}
            onClear={() => onClear(day, 'dinner')}
            onMoveTo={(toDay, toMealType) => onMoveTo(day, 'dinner', toDay, toMealType)}
            onToggleEatingOut={() => onToggleEatingOut(day, 'dinner')}
            onViewDetail={onViewDetail}
          />
        </div>
      ))}
    </div>
  )
}
