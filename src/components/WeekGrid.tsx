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
  if (!weekPlan) {
    return (
      <div className="text-center text-gray-500 py-12">
        Click "Generate" to create a meal plan
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-8 gap-2">
          <div className="font-medium text-gray-500 text-sm py-2" />
          {DAYS.map(day => (
            <div key={day} className="font-medium text-center text-sm py-2">
              {DAY_LABELS[day]}
            </div>
          ))}

          <div className="font-medium text-gray-500 text-sm py-2">Lunch</div>
          {DAYS.map(day => (
            <MealSlot
              key={`${day}-lunch`}
              meal={weekPlan[day].lunch}
              day={day}
              mealType="lunch"
              meals={meals}
              onSwap={(meal) => onSwap(day, 'lunch', meal)}
              onRegenerate={() => onRegenerate(day, 'lunch')}
              onClear={() => onClear(day, 'lunch')}
            />
          ))}

          <div className="font-medium text-gray-500 text-sm py-2">Dinner</div>
          {DAYS.map(day => (
            <MealSlot
              key={`${day}-dinner`}
              meal={weekPlan[day].dinner}
              day={day}
              mealType="dinner"
              meals={meals}
              onSwap={(meal) => onSwap(day, 'dinner', meal)}
              onRegenerate={() => onRegenerate(day, 'dinner')}
              onClear={() => onClear(day, 'dinner')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
