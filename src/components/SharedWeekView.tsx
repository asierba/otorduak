import type { Meal, WeekPlan, DayName } from '../types'
import { DAY_LABELS, getOrderedDays, getTagEmoji } from '../types'

const WEEK_PLAN_STORAGE_KEY = 'otorduak-week-plan'

function ReadOnlyMealCell({ meal }: { meal: Meal | null }) {
  if (!meal) {
    return (
      <div className="h-16 px-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 flex items-center">
        <span className="text-gray-300 dark:text-gray-600 text-sm">&mdash;</span>
      </div>
    )
  }

  return (
    <div className="h-16 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 flex items-center overflow-hidden">
      <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{getTagEmoji(meal.tags)} {meal.name}</span>
    </div>
  )
}

interface SharedWeekViewProps {
  weekPlan: WeekPlan
  weekStartDay?: DayName
}

export function SharedWeekView({ weekPlan, weekStartDay = 'monday' }: SharedWeekViewProps) {
  const orderedDays = getOrderedDays(weekStartDay)

  const handleImport = () => {
    localStorage.setItem(WEEK_PLAN_STORAGE_KEY, JSON.stringify(weekPlan))
    window.location.href = window.location.pathname
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <a href={window.location.pathname} className="text-xl font-bold text-gray-900 dark:text-gray-100 no-underline">😋🍽️ Otorduak</a>
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-1 rounded-full font-medium">
            Shared plan
          </span>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="space-y-2">
            <div className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 text-xs text-gray-500 font-medium">
              <div></div>
              <div className="text-center">Lunch</div>
              <div className="text-center">Dinner</div>
            </div>

            {orderedDays.map(day => (
              <div key={day} className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 items-center">
                <div className="font-bold text-sm text-gray-700 dark:text-gray-300">
                  {DAY_LABELS[day]}
                </div>
                <ReadOnlyMealCell meal={weekPlan[day].lunch} />
                <ReadOnlyMealCell meal={weekPlan[day].dinner} />
              </div>
            ))}
          </div>

          <button
            onClick={handleImport}
            className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl transition-colors"
          >
            Use this plan
          </button>
        </div>
      </main>
    </div>
  )
}
