import type { ArchivedWeek, DayName, Meal } from '../types'
import { DAY_LABELS, getOrderedDays, getTagEmoji } from '../types'

interface HistoryProps {
  archivedWeeks: ArchivedWeek[]
  onDelete: (id: string) => void
  onRestore: (week: ArchivedWeek) => void
  onViewDetail?: (meal: Meal) => void
}

const TrashIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const RestoreIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
)

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MiniWeekGrid({ plan, weekStartDay, onViewDetail }: { plan: ArchivedWeek['plan']; weekStartDay: DayName; onViewDetail?: (meal: Meal) => void }) {
  const orderedDays = getOrderedDays(weekStartDay)

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[1.5rem_1fr_1fr] gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
        <div></div>
        <div className="text-center">Lunch</div>
        <div className="text-center">Dinner</div>
      </div>
      {orderedDays.map(day => (
        <div key={day} className="grid grid-cols-[1.5rem_1fr_1fr] gap-1 items-center">
          <div className="font-bold text-xs text-gray-700 dark:text-gray-300">
            {DAY_LABELS[day]}
          </div>
          {(['lunch', 'dinner'] as const).map(mealType => {
            const meal = plan[day]?.[mealType]
            return (
              <button
                key={mealType}
                onClick={() => meal && onViewDetail?.(meal)}
                disabled={!meal}
                className={`text-[11px] leading-tight px-1.5 py-1 rounded text-left truncate ${
                  meal
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600'
                }`}
              >
                {meal ? `${getTagEmoji(meal.tags)} ${meal.name}` : '—'}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function History({ archivedWeeks, onDelete, onRestore, onViewDetail }: HistoryProps) {
  if (archivedWeeks.length === 0) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 mt-24">
        <p className="text-lg">No archived weeks yet.</p>
        <p className="text-sm mt-2">Archive your current week plan to save it here.</p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {archivedWeeks.map(week => (
        <div key={week.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatDate(week.archivedAt)}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onRestore(week)}
                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                aria-label="Restore this week plan"
                title="Restore as current plan"
              >
                {RestoreIcon}
              </button>
              <button
                onClick={() => onDelete(week.id)}
                className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                aria-label="Delete archived week"
                title="Delete"
              >
                {TrashIcon}
              </button>
            </div>
          </div>
          <MiniWeekGrid plan={week.plan} weekStartDay={week.weekStartDay} onViewDetail={onViewDetail} />
        </div>
      ))}
    </div>
  )
}
