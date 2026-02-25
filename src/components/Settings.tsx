import type { DayName } from '../types'
import { DAYS, DAY_FULL_LABELS } from '../types'

interface SettingsProps {
  weekStartDay: DayName
  onWeekStartDayChange: (day: DayName) => void
}

export function Settings({ weekStartDay, onWeekStartDayChange }: SettingsProps) {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        <div>
          <label htmlFor="week-start" className="block text-sm font-medium text-gray-700 mb-1">
            Week starts on
          </label>
          <select
            id="week-start"
            value={weekStartDay}
            onChange={(e) => onWeekStartDayChange(e.target.value as DayName)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {DAYS.map(day => (
              <option key={day} value={day}>
                {DAY_FULL_LABELS[day]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
