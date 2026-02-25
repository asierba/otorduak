import type { Meal, WeekPlan, DayName } from '../types'
import { DAY_LABELS, getOrderedDays, getTagEmoji } from '../types'

function ReadOnlyMealCell({ meal }: { meal: Meal | null }) {
  if (!meal) {
    return (
      <div className="h-16 px-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center">
        <span className="text-gray-300 text-sm">—</span>
      </div>
    )
  }

  return (
    <div className="h-16 px-3 rounded-xl bg-white border border-gray-200 flex items-center overflow-hidden">
      <span className="text-sm line-clamp-2">{getTagEmoji(meal.tags)} {meal.name}</span>
    </div>
  )
}

interface SharedWeekViewProps {
  weekPlan: WeekPlan
  weekStartDay?: DayName
}

export function SharedWeekView({ weekPlan, weekStartDay = 'monday' }: SharedWeekViewProps) {
  const orderedDays = getOrderedDays(weekStartDay)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">😋🍽️ Otorduak</h1>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
            Read-only snapshot
          </span>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="space-y-2">
            <div className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 text-xs text-gray-500 font-medium">
              <div></div>
              <div className="text-center">Lunch</div>
              <div className="text-center">Dinner</div>
            </div>

            {orderedDays.map(day => (
              <div key={day} className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 items-center">
                <div className="font-bold text-sm text-gray-700">
                  {DAY_LABELS[day]}
                </div>
                <ReadOnlyMealCell meal={weekPlan[day].lunch} />
                <ReadOnlyMealCell meal={weekPlan[day].dinner} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
