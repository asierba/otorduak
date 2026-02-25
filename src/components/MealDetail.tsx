import type { Meal } from '../types'

interface MealDetailProps {
  meal: Meal
  onBack: () => void
}

export function MealDetail({ meal, onBack }: MealDetailProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-lg transition-colors"
            aria-label="Back to meals list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{meal.name}</h1>
        </header>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {meal.tags.map(tag => (
              <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {meal.url && (
            <a
              href={meal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open recipe
            </a>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Ingredients ({meal.ingredients.length})
            </h2>
            {meal.ingredients.length > 0 ? (
              <ul className="space-y-2">
                {meal.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 dark:text-gray-100">{ing.name}</span>
                    {ing.quantity && (
                      <span className="text-gray-400 dark:text-gray-500 ml-2">{ing.quantity}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No ingredients listed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
