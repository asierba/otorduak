import type { Meal, WeekPlan, DayName, MealType } from '../types'
import { DAYS } from '../types'
import { FREQUENCY_RULES } from '../data/rules'

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const WEEKDAYS: DayName[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

export function getSlotCategory(day: DayName, mealType: MealType): string {
  const isWeekday = WEEKDAYS.includes(day)
  if (isWeekday && mealType === 'lunch') return 'weekday-lunch'
  if (isWeekday && mealType === 'dinner') return 'weekday-dinner'
  if (!isWeekday && mealType === 'lunch') return 'weekend-lunch'
  return 'weekend-dinner'
}

function getCandidates(meals: Meal[], day: DayName, mealType: MealType): Meal[] {
  const category = getSlotCategory(day, mealType)
  const isWeekday = WEEKDAYS.includes(day)

  return meals.filter(meal => {
    if (meal.tags.includes(category)) return true
    if (isWeekday && meal.tags.includes('general')) return true
    return false
  })
}

function createEmptyWeekPlan(): WeekPlan {
  const plan: Partial<WeekPlan> = {}
  for (const day of DAYS) {
    plan[day] = { lunch: null, dinner: null }
  }
  return plan as WeekPlan
}

export function generateWeekPlan(meals: Meal[]): WeekPlan {
  const usedMealIds = new Set<string>()
  const plan = createEmptyWeekPlan()

  // Phase 1: Satisfy frequency rules by placing required meals in random weekday slots
  for (const rule of FREQUENCY_RULES) {
    const ruleMeals = shuffle(meals.filter(m => m.tags.includes(rule.tag)))
    const availableDays = shuffle([...WEEKDAYS])

    let placed = 0
    for (const day of availableDays) {
      if (placed >= rule.count) break
      if (plan[day][rule.mealType] !== null) continue

      const candidate = ruleMeals.find(m => !usedMealIds.has(m.id))
      if (!candidate) break

      plan[day][rule.mealType] = candidate
      usedMealIds.add(candidate.id)
      placed++
    }
  }

  // Phase 2: Fill remaining slots by category
  for (const day of DAYS) {
    for (const mealType of ['lunch', 'dinner'] as const) {
      if (plan[day][mealType] !== null) continue

      const candidates = getCandidates(meals, day, mealType)
        .filter(m => !usedMealIds.has(m.id))

      if (candidates.length > 0) {
        const selected = shuffle(candidates)[0]
        plan[day][mealType] = selected
        usedMealIds.add(selected.id)
      }
    }
  }

  return plan
}

export function getMealsForSlot(meals: Meal[], day: DayName, mealType: MealType): Meal[] {
  return getCandidates(meals, day, mealType)
}

export function regenerateSlot(
  meals: Meal[],
  day: DayName,
  mealType: MealType,
  currentPlan: WeekPlan,
  currentMealId?: string
): Meal | null {
  let candidates = getCandidates(meals, day, mealType)

  if (currentMealId) {
    candidates = candidates.filter(m => m.id !== currentMealId)
  }

  const usedMealIds = new Set<string>()
  for (const d of DAYS) {
    const dayPlan = currentPlan[d]
    if (dayPlan.lunch && !(d === day && mealType === 'lunch')) {
      usedMealIds.add(dayPlan.lunch.id)
    }
    if (dayPlan.dinner && !(d === day && mealType === 'dinner')) {
      usedMealIds.add(dayPlan.dinner.id)
    }
  }

  candidates = candidates.filter(m => !usedMealIds.has(m.id))

  if (candidates.length === 0) return null

  return shuffle(candidates)[0]
}
