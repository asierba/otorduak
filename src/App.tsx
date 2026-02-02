import { useState } from 'react'
import type { Meal, WeekPlan, DayName, MealType } from './types'
import { WeekGrid } from './components/WeekGrid'
import { generateWeekPlan, regenerateSlot } from './utils/generator'
import mealsData from './data/meals.json'

const meals: Meal[] = mealsData

function App() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null)

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
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Otorduak</h1>
          <p className="text-gray-600">Weekly meal planner</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <WeekGrid
            weekPlan={weekPlan}
            meals={meals}
            onSwap={handleSwap}
            onRegenerate={handleRegenerate}
            onClear={handleClear}
          />
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Week
        </button>
      </div>
    </div>
  )
}

export default App
