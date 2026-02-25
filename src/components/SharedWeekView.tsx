import type { Meal, WeekPlan, DayName } from '../types'
import { DAY_LABELS, getOrderedDays, getTagEmoji } from '../types'

interface ReadOnlyMealCellProps {
  meal: Meal | null
}

function ReadOnlyMealCell({ meal }: ReadOnlyMealCellProps) {
  if (!meal) {
    return (
      <div className="w-full h-16 px-3 flex items-center bg-gray-50 border border-gray-100 rounded-xl text-gray-400 text-sm">
        —
      </div>
    )
  }
  return (
    <div className="w-full h-16 px-3 flex items-center bg-white border border-gray-200 rounded-xl text-sm overflow-hidden">
      <span className="line-clamp-2">{getTagEmoji(meal.tags)} {meal.name}</span>
    </div>
  )
}

interface SharedWeekViewProps {
  weekPlan: WeekPlan
}

export function SharedWeekView({ weekPlan }: SharedWeekViewProps) {
  const orderedDays = getOrderedDays('monday')

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-center gap-2">
        <span>📋</span>
        <span>This is a shared week plan snapshot (read-only)</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="space-y-2">
          <div className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 text-xs text-gray-500 font-medium">
            <div></div>
            <div className="text-center">Lunch</div>
            <div className="text-center">Dinner</div>
          </div>

          {orderedDays.map(day => (
            <div key={day} className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 items-center">
              <div className="font-bold text-sm text-gray-700">{DAY_LABELS[day]}</div>
              <ReadOnlyMealCell meal={weekPlan[day].lunch} />
              <ReadOnlyMealCell meal={weekPlan[day].dinner} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface SharedWeekErrorProps {
  message: string
}

export function SharedWeekError({ message }: SharedWeekErrorProps) {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="px-4 py-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="text-red-700 font-medium mb-1">Could not load shared week plan</p>
        <p className="text-red-600 text-sm">{message}</p>
      </div>
    </div>
  )
}
