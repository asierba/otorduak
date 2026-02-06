import { useState, useEffect } from 'react'
import type { Meal, WeekPlan, DayName, MealType } from './types'
import { DAYS, DAY_FULL_LABELS } from './types'
import { WeekGrid } from './components/WeekGrid'
import { generateWeekPlan, regenerateSlot } from './utils/generator'
import mealsData from './data/meals.json'

const meals: Meal[] = mealsData

const STORAGE_KEY = 'otorduak-week-start-day'

function getStoredWeekStartDay(): DayName {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && DAYS.includes(stored as DayName)) {
    return stored as DayName
  }
  return 'monday'
}

function App() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null)
  const [weekStartDay, setWeekStartDay] = useState<DayName>(getStoredWeekStartDay)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, weekStartDay)
  }, [weekStartDay])

  const handleGenerate = () => {
    setWeekPlan(generateWeekPlan(meals))
  }

  const handleSwap = (day: DayName, mealType: MealType, meal: Meal) => {
    if (!weekPlan) return
    setWeekPlan({
      ...weekPlan,
      [day]: {
        ...weekPlan[day],
        [mealType]: meal
      }
    })
  }

  const handleRegenerate = (day: DayName, mealType: MealType) => {
    if (!weekPlan) return
    const currentMeal = weekPlan[day][mealType]
    const newMeal = regenerateSlot(meals, day, mealType, weekPlan, currentMeal?.id)
    if (newMeal) {
      handleSwap(day, mealType, newMeal)
    }
  }

  const handleClear = (day: DayName, mealType: MealType) => {
    if (!weekPlan) return
    setWeekPlan({
      ...weekPlan,
      [day]: {
        ...weekPlan[day],
        [mealType]: null
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">😋🍽️ Otorduak</h1>
          <div className="flex items-center gap-2">
            <select
              id="week-start"
              value={weekStartDay}
              onChange={(e) => setWeekStartDay(e.target.value as DayName)}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAYS.map(day => (
                <option key={day} value={day}>
                  {DAY_FULL_LABELS[day]}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              className="p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
              aria-label="Regenerate meal plan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6" />
                <path d="M2.5 22v-6h6" />
                <path d="M2.5 11.5a10 10 0 0 1 18.4-4.5L21.5 8" />
                <path d="M21.5 12.5a10 10 0 0 1-18.4 4.5L2.5 16" />
              </svg>
            </button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <WeekGrid
            weekPlan={weekPlan}
            meals={meals}
            weekStartDay={weekStartDay}
            onSwap={handleSwap}
            onRegenerate={handleRegenerate}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  )
}

export default App
