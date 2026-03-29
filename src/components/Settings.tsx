import type { DayName } from '../types'
import { DAYS, DAY_FULL_LABELS } from '../types'
import type { Theme } from '../hooks/useTheme'

interface SettingsProps {
  weekStartDay: DayName
  onWeekStartDayChange: (day: DayName) => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
  notificationsEnabled: boolean
  onNotificationsEnabledChange: (enabled: boolean) => void
  notificationPermission: NotificationPermission | 'unsupported'
}

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function Settings({ weekStartDay, onWeekStartDayChange, theme, onThemeChange, notificationsEnabled, onNotificationsEnabledChange, notificationPermission }: SettingsProps) {
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

        <div>
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="defrost-notifications" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Defrost reminders
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Get notified the day before a frozen meal so you can take it out of the freezer
              </p>
            </div>
            <button
              id="defrost-notifications"
              role="switch"
              aria-checked={notificationsEnabled}
              onClick={() => onNotificationsEnabledChange(!notificationsEnabled)}
              disabled={notificationPermission === 'unsupported'}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              } ${notificationPermission === 'unsupported' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {notificationPermission === 'unsupported' && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Notifications are not supported in this browser.
            </p>
          )}
          {notificationPermission === 'denied' && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
