import { useState, useMemo } from 'react'
import type { Meal } from '../types'

interface MealsListProps {
  meals: Meal[]
  onSelectMeal: (meal: Meal) => void
  onBack?: () => void
}

export function MealsList({ meals, onSelectMeal, onBack }: MealsListProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    meals.forEach(m => m.tags.forEach(t => tags.add(t)))
    return [...tags].sort()
  }, [meals])

  const filteredMeals = useMemo(() => {
    let result = meals
    if (selectedTags.size > 0) {
      result = result.filter(m => [...selectedTags].every(t => m.tags.includes(t)))
    }
    if (search.trim()) {
      const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      const q = normalize(search)
      result = result.filter(m => normalize(m.name).includes(q))
    }
    return result.sort((a, b) => a.name.localeCompare(b.name))
  }, [meals, selectedTags, search])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-4 flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-lg transition-colors"
              aria-label="Back to planner"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">All Meals</h1>
          <span className="text-sm text-gray-400 dark:text-gray-500 ml-auto">{filteredMeals.length}</span>
        </header>

        <input
          type="text"
          placeholder="Search meals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-3 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
        />

        <div className="flex flex-wrap gap-2 mb-4">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedTags.has(tag)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {filteredMeals.map(meal => (
            <button
              key={meal.name}
              onClick={() => onSelectMeal(meal)}
              className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{meal.name}</span>
              <div className="flex gap-1">
                {meal.tags.map(tag => (
                  <span key={tag} className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
          {filteredMeals.length === 0 && (
            <p className="text-center text-gray-400 dark:text-gray-500 py-8">No meals match the current filters</p>
          )}
        </div>
      </div>
    </div>
  )
}
