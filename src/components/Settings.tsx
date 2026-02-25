import type { DayName } from '../types'
import { DAYS, DAY_FULL_LABELS } from '../types'
import type { Theme } from '../hooks/useTheme'

interface SettingsProps {
  weekStartDay: DayName
  onWeekStartDayChange: (day: DayName) => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function Settings({ weekStartDay, onWeekStartDayChange, theme, onThemeChange }: SettingsProps) {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 space-y-4">
        <div>
          <label htmlFor="week-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Week starts on
          </label>
          <select
            id="week-start"
            value={weekStartDay}
            onChange={(e) => onWeekStartDayChange(e.target.value as DayName)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
          >
            {DAYS.map(day => (
              <option key={day} value={day}>
                {DAY_FULL_LABELS[day]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Appearance
          </label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as Theme)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
          >
            {THEME_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
