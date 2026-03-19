import type { ColorScheme } from '../../types'

export const FROZEN_COLORS: ColorScheme = {
  button: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/50',
  badge: 'bg-blue-600 dark:bg-blue-500',
  chip: 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/50',
  chipRemove: 'text-sky-400 hover:text-sky-700 dark:hover:text-sky-300',
  selected: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300',
  selectedEmoji: '🧊',
}

export const PINNED_COLORS: ColorScheme = {
  button: 'bg-green-50 dark:bg-emerald-950/50 text-green-700 dark:text-emerald-300 border-green-200 dark:border-emerald-800/60 hover:bg-green-100 dark:hover:bg-emerald-900/50',
  badge: 'bg-green-600 dark:bg-emerald-500',
  chip: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
  chipRemove: 'text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300',
  selected: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  selectedEmoji: '📌',
}
