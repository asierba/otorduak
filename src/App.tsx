import { useState, useEffect } from 'react'
import type { Meal, WeekPlan, DayName, MealType } from './types'
import { DAYS, DAY_FULL_LABELS, DAY_LABELS } from './types'
import { WeekGrid } from './components/WeekGrid'
import { VariantAccordion } from './components/experiments/VariantAccordion'
import { GroceryList } from './components/GroceryList'
import { MealsList } from './components/MealsList'
import { MealDetail } from './components/MealDetail'
import { UpdatePrompt } from './components/UpdatePrompt'
import { generateWeekPlan, regenerateSlot } from './utils/generator'
import mealsData from './data/meals.json'

type View = { screen: 'planner' } | { screen: 'meals-list' } | { screen: 'meal-detail'; meal: Meal } | { screen: 'grocery-list' }

const meals: Meal[] = mealsData

const STORAGE_KEY = 'otorduak-week-start-day'
const WEEK_PLAN_STORAGE_KEY = 'otorduak-week-plan'
const FROZEN_MEALS_STORAGE_KEY = 'otorduak-frozen-meals'
const PINNED_MEALS_STORAGE_KEY = 'otorduak-pinned-meals'

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
  const [linkCopied, setLinkCopied] = useState(false)
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false)

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

  const handleShare = () => {
    if (!weekPlan) return
    const compact: Record<string, { lunch: string | null; dinner: string | null }> = {}
    for (const day of DAYS) {
      compact[day] = {
        lunch: weekPlan[day].lunch?.name ?? null,
        dinner: weekPlan[day].dinner?.name ?? null,
      }
    }
    const json = JSON.stringify(compact)
    const encoded = btoa(unescape(encodeURIComponent(json)))
    const url = `${window.location.origin}${window.location.pathname}?plan=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  const allUnplaced = [...unplacedFrozenNames, ...unplacedPinnedNames]

  if (view.screen === 'grocery-list' && weekPlan) {
    return (
      <>
        <GroceryList weekPlan={weekPlan} onBack={() => setView({ screen: 'planner' })} />
        <UpdatePrompt />
      </>
    )
  }

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
            <div className="relative">
              {dayDropdownOpen && (
                <div className="fixed inset-0 z-10" onClick={() => setDayDropdownOpen(false)} />
              )}
              <button
                onClick={() => setDayDropdownOpen(o => !o)}
                className="w-7 h-7 flex items-center justify-center text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 relative z-20"
                aria-label={`Week starts on ${DAY_FULL_LABELS[weekStartDay]}`}
              >
                {DAY_LABELS[weekStartDay]}
              </button>
              {dayDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => { setWeekStartDay(day); setDayDropdownOpen(false) }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${weekStartDay === day ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700'}`}
                    >
                      {DAY_FULL_LABELS[day]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setView({ screen: 'meals-list' })}
              className="p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
              aria-label="Browse all meals"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            {weekPlan && (
              <button
                onClick={() => setView({ screen: 'grocery-list' })}
                className="p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                aria-label="Show grocery list"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </button>
            )}
            {weekPlan && (
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                aria-label="Share week plan"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            )}
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
        ) : (
          <div className="text-center text-gray-400 mt-24">
            <p className="text-lg inline-flex items-center gap-2">Press <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><path d="M21.5 2v6h-6" /><path d="M2.5 22v-6h6" /><path d="M2.5 11.5a10 10 0 0 1 18.4-4.5L21.5 8" /><path d="M21.5 12.5a10 10 0 0 1-18.4 4.5L2.5 16" /></svg> to generate a meal plan</p>
          </div>
        )}

      </div>
      <UpdatePrompt />
      {linkCopied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          Link copied!
        </div>
      )}
    </div>
  )
}

export default App
