import { useState, useEffect } from 'react'
import type { Meal, WeekPlan, DayName, MealType } from './types'
import { DAYS } from './types'
import { WeekGrid } from './components/WeekGrid'
import { VariantAccordion } from './components/experiments/VariantAccordion'
import { GroceryList } from './components/GroceryList'
import { MealsList } from './components/MealsList'
import { MealDetail } from './components/MealDetail'
import { Settings } from './components/Settings'
import { UpdatePrompt } from './components/UpdatePrompt'
import { generateWeekPlan, regenerateSlot } from './utils/generator'
import mealsData from './data/meals.json'

type TabScreen = 'week' | 'grocery' | 'meals-list' | 'settings'

type View =
  | { screen: 'week' }
  | { screen: 'grocery' }
  | { screen: 'meals-list' }
  | { screen: 'meal-detail'; meal: Meal }
  | { screen: 'settings' }

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

function getActiveTab(view: View): TabScreen {
  if (view.screen === 'meal-detail') return 'meals-list'
  return view.screen
}

function TabIcon({ screen }: { screen: TabScreen }) {
  if (screen === 'week') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )
  }
  if (screen === 'grocery') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    )
  }
  if (screen === 'meals-list') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

const TAB_LABELS: Record<TabScreen, string> = {
  week: 'Week',
  grocery: 'Grocery',
  'meals-list': 'Meals',
  settings: 'Settings',
}

const TAB_SCREENS: TabScreen[] = ['week', 'grocery', 'meals-list', 'settings']

const RegenerateIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6" />
    <path d="M2.5 22v-6h6" />
    <path d="M2.5 11.5a10 10 0 0 1 18.4-4.5L21.5 8" />
    <path d="M21.5 12.5a10 10 0 0 1-18.4 4.5L2.5 16" />
  </svg>
)

function App() {
  const [view, setView] = useState<View>({ screen: 'week' })
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(() => getStoredJson(WEEK_PLAN_STORAGE_KEY, null))
  const [weekStartDay, setWeekStartDay] = useState<DayName>(getStoredWeekStartDay)
  const [frozenMeals, setFrozenMeals] = useState<Meal[]>(() => getStoredJson(FROZEN_MEALS_STORAGE_KEY, []))
  const [pinnedMeals, setPinnedMeals] = useState<Meal[]>(() => getStoredJson(PINNED_MEALS_STORAGE_KEY, []))
  const [frozenMealNames, setFrozenMealNames] = useState<Set<string>>(new Set())
  const [unplacedFrozenNames, setUnplacedFrozenNames] = useState<string[]>([])
  const [unplacedPinnedNames, setUnplacedPinnedNames] = useState<string[]>([])

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
      [day]: { ...weekPlan[day], [mealType]: meal }
    })
  }

  const handleRegenerate = (day: DayName, mealType: MealType) => {
    if (!weekPlan) return
    const currentMeal = weekPlan[day][mealType]
    const newMeal = regenerateSlot(meals, day, mealType, weekPlan, currentMeal?.name)
    if (newMeal) handleSwap(day, mealType, newMeal)
  }

  const handleClear = (day: DayName, mealType: MealType) => {
    if (!weekPlan) return
    setWeekPlan({
      ...weekPlan,
      [day]: { ...weekPlan[day], [mealType]: null }
    })
  }

  const navigateToTab = (screen: TabScreen) => {
    setView({ screen })
  }

  const activeTab = getActiveTab(view)
  const allUnplaced = [...unplacedFrozenNames, ...unplacedPinnedNames]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* App Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
        {/* Mobile top bar: title (left) + regenerate (right) */}
        <div className="flex md:hidden items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">😋🍽️ Otorduak</h1>
          <button
            onClick={handleGenerate}
            className="p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
            aria-label="Regenerate meal plan"
          >
            {RegenerateIcon}
          </button>
        </div>

        {/* Desktop header: title + tab nav (left) + regenerate (right) */}
        <div className="hidden md:flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">😋🍽️ Otorduak</h1>
            <nav className="flex items-center gap-1" aria-label="Main navigation">
              {TAB_SCREENS.map(screen => (
                <button
                  key={screen}
                  onClick={() => navigateToTab(screen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === screen
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                  aria-current={activeTab === screen ? 'page' : undefined}
                >
                  <TabIcon screen={screen} />
                  {TAB_LABELS[screen]}
                </button>
              ))}
            </nav>
          </div>
          <button
            onClick={handleGenerate}
            className="p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
            aria-label="Regenerate meal plan"
          >
            {RegenerateIcon}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-16 md:pb-0">
        {view.screen === 'week' && (
          <div className="p-4 max-w-4xl mx-auto">
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
                <p className="text-lg inline-flex items-center gap-2">
                  Press{' '}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                    <path d="M21.5 2v6h-6" />
                    <path d="M2.5 22v-6h6" />
                    <path d="M2.5 11.5a10 10 0 0 1 18.4-4.5L21.5 8" />
                    <path d="M21.5 12.5a10 10 0 0 1-18.4 4.5L2.5 16" />
                  </svg>
                  {' '}to generate a meal plan
                </p>
              </div>
            )}
          </div>
        )}

        {view.screen === 'grocery' && (
          weekPlan ? (
            <GroceryList weekPlan={weekPlan} />
          ) : (
            <div className="text-center text-gray-400 mt-24">
              <p className="text-lg">Generate a meal plan first to see the grocery list.</p>
            </div>
          )
        )}

        {view.screen === 'meals-list' && (
          <MealsList
            meals={meals}
            onSelectMeal={(meal) => setView({ screen: 'meal-detail', meal })}
          />
        )}

        {view.screen === 'meal-detail' && (
          <MealDetail
            meal={view.meal}
            onBack={() => setView({ screen: 'meals-list' })}
          />
        )}

        {view.screen === 'settings' && (
          <Settings
            weekStartDay={weekStartDay}
            onWeekStartDayChange={setWeekStartDay}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 inset-x-0 z-20 md:hidden bg-white border-t border-gray-200"
        aria-label="Bottom navigation"
      >
        <div className="flex">
          {TAB_SCREENS.map(screen => (
            <button
              key={screen}
              onClick={() => navigateToTab(screen)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                activeTab === screen
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-current={activeTab === screen ? 'page' : undefined}
            >
              <TabIcon screen={screen} />
              <span>{TAB_LABELS[screen]}</span>
            </button>
          ))}
        </div>
      </nav>

      <UpdatePrompt />
    </div>
  )
}

export default App
