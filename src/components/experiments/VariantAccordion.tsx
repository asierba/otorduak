import { useState } from 'react'
import type { Meal, PreSelectionVariantProps } from '../../types'
import { MealPickerSheet } from './MealPickerSheet'
import { FROZEN_COLORS, PINNED_COLORS } from './colors'

export function VariantAccordion({
  meals,
  frozenMeals,
  pinnedMeals,
  onFrozenChange,
  onPinnedChange,
}: PreSelectionVariantProps) {
  const [expanded, setExpanded] = useState<'frozen' | 'pinned' | null>(null)
  const [openSheet, setOpenSheet] = useState<'frozen' | 'pinned' | null>(null)

  const toggleExpand = (panel: 'frozen' | 'pinned') => {
    setExpanded(expanded === panel ? null : panel)
  }

  const removeMeal = (list: Meal[], onChange: (m: Meal[]) => void, name: string) => {
    onChange(list.filter(m => m.name !== name))
  }

  const toggleMeal = (list: Meal[], onChange: (m: Meal[]) => void) => (meal: Meal) => {
    const exists = list.some(m => m.name === meal.name)
    onChange(exists ? list.filter(m => m.name !== meal.name) : [...list, meal])
  }

  return (
    <div className="space-y-1">
      <div>
        <div className="flex gap-2">
          <button
            onClick={() => toggleExpand('frozen')}
            className={`px-3 py-1.5 text-sm border rounded-lg transition-colors flex items-center gap-1 ${FROZEN_COLORS.button}`}
          >
            🧊 Frozen
            {frozenMeals.length > 0 && (
              <span className={`text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${FROZEN_COLORS.badge}`}>
                {frozenMeals.length}
              </span>
            )}
            <span className="ml-1 text-xs">{expanded === 'frozen' ? '▲' : '▼'}</span>
          </button>

          <button
            onClick={() => toggleExpand('pinned')}
            className={`px-3 py-1.5 text-sm border rounded-lg transition-colors flex items-center gap-1 ${PINNED_COLORS.button}`}
          >
            📌 Must-have
            {pinnedMeals.length > 0 && (
              <span className={`text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${PINNED_COLORS.badge}`}>
                {pinnedMeals.length}
              </span>
            )}
            <span className="ml-1 text-xs">{expanded === 'pinned' ? '▲' : '▼'}</span>
          </button>
        </div>

        {expanded === 'frozen' && (
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            {frozenMeals.map(m => (
              <span
                key={m.name}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-full ${FROZEN_COLORS.chip}`}
              >
                🧊 {m.name}
                <button
                  onClick={() => removeMeal(frozenMeals, onFrozenChange, m.name)}
                  className={`ml-0.5 ${FROZEN_COLORS.chipRemove}`}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => setOpenSheet('frozen')}
              className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-700"
            >
              + Add
            </button>
          </div>
        )}

        {expanded === 'pinned' && (
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            {pinnedMeals.map(m => (
              <span
                key={m.name}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-full ${PINNED_COLORS.chip}`}
              >
                📌 {m.name}
                <button
                  onClick={() => removeMeal(pinnedMeals, onPinnedChange, m.name)}
                  className={`ml-0.5 ${PINNED_COLORS.chipRemove}`}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => setOpenSheet('pinned')}
              className="px-2 py-1 text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full border border-green-200 dark:border-green-700"
            >
              + Add
            </button>
          </div>
        )}
      </div>

      {openSheet === 'frozen' && (
        <MealPickerSheet
          meals={meals}
          selectedMeals={frozenMeals}
          onToggle={toggleMeal(frozenMeals, onFrozenChange)}
          onClose={() => setOpenSheet(null)}
          title="Select frozen meals"
          colorScheme={FROZEN_COLORS}
        />
      )}

      {openSheet === 'pinned' && (
        <MealPickerSheet
          meals={meals}
          selectedMeals={pinnedMeals}
          onToggle={toggleMeal(pinnedMeals, onPinnedChange)}
          onClose={() => setOpenSheet(null)}
          title="Select must-have meals"
          colorScheme={PINNED_COLORS}
        />
      )}
    </div>
  )
}
