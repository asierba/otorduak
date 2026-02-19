import { useState, useEffect } from 'react'
import type { Meal, WeekPlan, DayName, MealType, WeekPlanHistoryEntry } from './types'
import { DAYS, DAY_FULL_LABELS } from './types'
import { WeekGrid } from './components/WeekGrid'
import { VariantAccordion } from './components/experiments/VariantAccordion'
import { GroceryList } from './components/GroceryList'
import { MealsList } from './components/MealsList'
import { MealDetail } from './components/MealDetail'
import { UpdatePrompt } from './components/UpdatePrompt'
import { generateWeekPlan, regenerateSlot } from './utils/generator'
import mealsData from './data/meals.json'

type View = { screen: 'planner' } | { screen: 'meals-list' } | { screen: 'meal-detail'; meal: Meal }

const meals: Meal[] = mealsData

const STORAGE_KEY = 'otorduak-week-start-day'
const WEEK_PLAN_STORAGE_KEY = 'otorduak-week-plan'
const FROZEN_MEALS_STORAGE_KEY = 'otorduak-frozen-meals'
const PINNED_MEALS_STORAGE_KEY = 'otorduak-pinned-meals'
const WEEK_HISTORY_STORAGE_KEY = 'otorduak-week-history'

function getStoredJson<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function getStoredWeekStartDay(): DayName {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && DAYS.includes(stored as DayName)) {
    return stored as DayName
  }
  return 'monday'
}

function App() {
  const [view, setView] = useState<View>({ screen: 'planner' })
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(() => getStoredJson(WEEK_PLAN_STORAGE_KEY, null))
  const [weekStartDay, setWeekStartDay] = useState<DayName>(getStoredWeekStartDay)
  const [frozenMeals, setFrozenMeals] = useState<Meal[]>(() => getStoredJson(FROZEN_MEALS_STORAGE_KEY, []))
  const [pinnedMeals, setPinnedMeals] = useState<Meal[]>(() => getStoredJson(PINNED_MEALS_STORAGE_KEY, []))
  const [frozenMealNames, setFrozenMealNames] = useState<Set<string>>(new Set())
  const [unplacedFrozenNames, setUnplacedFrozenNames] = useState<string[]>([])
  const [unplacedPinnedNames, setUnplacedPinnedNames] = useState<string[]>([])
  const [showGroceryList, setShowGroceryList] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, weekStartDay)
  }, [weekStartDay])

  useEffect(() => {
    if (weekPlan) {
      localStorage.setItem(WEEK_PLAN_STORAGE_KEY, JSON.stringify(weekPlan))
    }
  }, [weekPlan])

  useEffect(() => {
    localStorage.setItem(FROZEN_MEALS_STORAGE_KEY, JSON.stringify(frozenMeals))
  }, [frozenMeals])

  useEffect(() => {
    localStorage.setItem(PINNED_MEALS_STORAGE_KEY, JSON.stringify(pinnedMeals))
  }, [pinnedMeals])

  const handleGenerate = () => {
    const result = generateWeekPlan(meals, frozenMeals, pinnedMeals)
    setWeekPlan(result.plan)
    setFrozenMealNames(result.placedFrozenNames)
    setUnplacedFrozenNames(result.unplacedFrozenNames)
    setUnplacedPinnedNames(result.unplacedPinnedNames)
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
    const newMeal = regenerateSlot(meals, day, mealType, weekPlan, currentMeal?.name)
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

  const handleArchive = () => {
    if (!weekPlan) return
    const entry: WeekPlanHistoryEntry = {
      weekPlan,
      createdAt: new Date().toISOString()
    }
    const history = getStoredJson<WeekPlanHistoryEntry[]>(WEEK_HISTORY_STORAGE_KEY, [])
    const updated = [entry, ...history]
    localStorage.setItem(WEEK_HISTORY_STORAGE_KEY, JSON.stringify(updated))
  }

  const allUnplaced = [...unplacedFrozenNames, ...unplacedPinnedNames]

  if (view.screen === 'meal-detail') {
    return (
      <>
        <MealDetail meal={view.meal} onBack={() => setView({ screen: 'meals-list' })} />
        <UpdatePrompt />
      </>
    )
  }

  if (view.screen === 'meals-list') {
    return (
      <>
        <MealsList
          meals={meals}
          onSelectMeal={(meal) => setView({ screen: 'meal-detail', meal })}
          onBack={() => setView({ screen: 'planner' })}
        />
        <UpdatePrompt />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">😋🍽️ Otorduak</h1>
          <div className="flex items-center gap-2">
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
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[180px]">
                    <button
                      onClick={() => { setView({ screen: 'meals-list' }); setShowMenu(false) }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                      Browse meals
                    </button>
                    {weekPlan && (
                      <button
                        onClick={() => { setShowGroceryList(true); setShowMenu(false) }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                          <path d="M3 6h18" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        Grocery list
                      </button>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <div className="px-4 py-2 flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-500">Week starts</span>
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
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="mb-4">
          <VariantAccordion
            meals={meals}
            frozenMeals={frozenMeals}
            pinnedMeals={pinnedMeals}
            onFrozenChange={setFrozenMeals}
            onPinnedChange={setPinnedMeals}
          />
        </div>

        {allUnplaced.length > 0 && (
          <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            Could not fit in the plan: {allUnplaced.join(', ')}. No valid slot available.
          </div>
        )}

        {weekPlan ? (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <WeekGrid
                weekPlan={weekPlan}
                meals={meals}
                weekStartDay={weekStartDay}
                frozenMealNames={frozenMealNames}
                onSwap={handleSwap}
                onRegenerate={handleRegenerate}
                onClear={handleClear}
              />
            </div>
            <button
              onClick={handleArchive}
              className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
            >
              Archive this week
            </button>
          </>
        ) : (
          <div className="text-center text-gray-400 mt-24">
            <p className="text-lg inline-flex items-center gap-2">Press <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><path d="M21.5 2v6h-6" /><path d="M2.5 22v-6h6" /><path d="M2.5 11.5a10 10 0 0 1 18.4-4.5L21.5 8" /><path d="M21.5 12.5a10 10 0 0 1-18.4 4.5L2.5 16" /></svg> to generate a meal plan</p>
          </div>
        )}

        {showGroceryList && weekPlan && (
          <GroceryList
            weekPlan={weekPlan}
            onClose={() => setShowGroceryList(false)}
          />
        )}
      </div>
      <UpdatePrompt />
    </div>
  )
}

export default App
