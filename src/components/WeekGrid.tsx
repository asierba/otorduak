import type { Meal, WeekPlan, DayName, MealType } from '../types'
import { DAYS, DAY_LABELS } from '../types'
import { MealSlot } from './MealSlot'

interface WeekGridProps {
  weekPlan: WeekPlan | null
  meals: Meal[]
  onSwap: (day: DayName, mealType: MealType, meal: Meal) => void
  onRegenerate: (day: DayName, mealType: MealType) => void
  onClear: (day: DayName, mealType: MealType) => void
}

export function WeekGrid({ weekPlan, meals, onSwap, onRegenerate, onClear }: WeekGridProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 text-xs text-gray-500 font-medium">
        <div></div>
        <div className="text-center">Lunch</div>
        <div className="text-center">Dinner</div>
      </div>

      {DAYS.map(day => (
        <div key={day} className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 items-center">
          <div className="font-bold text-sm text-gray-700">
            {DAY_LABELS[day]}
          </div>
          <MealSlot
            meal={weekPlan?.[day].lunch ?? null}
            day={day}
            mealType="lunch"
            meals={meals}
            onSwap={(meal) => onSwap(day, 'lunch', meal)}
            onRegenerate={() => onRegenerate(day, 'lunch')}
            onClear={() => onClear(day, 'lunch')}
          />
          <MealSlot
            meal={weekPlan?.[day].dinner ?? null}
            day={day}
            mealType="dinner"
            meals={meals}
            onSwap={(meal) => onSwap(day, 'dinner', meal)}
            onRegenerate={() => onRegenerate(day, 'dinner')}
            onClear={() => onClear(day, 'dinner')}
          />
        </div>
      ))}
    </div>
  )
}
