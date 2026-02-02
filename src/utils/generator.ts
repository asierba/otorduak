import type { Meal, WeekPlan, DayName, MealType } from '../types'
import { DAYS } from '../types'
import { getRuleForSlot } from '../data/rules'

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getCandidates(meals: Meal[], day: DayName, mealType: MealType): Meal[] {
  const rule = getRuleForSlot(day, mealType)
  if (!rule) return meals
  return meals.filter(meal => meal.tags.includes(rule.requiredTag))
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

  for (const day of DAYS) {
    for (const mealType of ['lunch', 'dinner'] as const) {
      let candidates = getCandidates(meals, day, mealType)

      const unusedCandidates = candidates.filter(m => !usedMealIds.has(m.id))
      if (unusedCandidates.length > 0) {
        candidates = unusedCandidates
      }

      if (candidates.length > 0) {
        const shuffled = shuffle(candidates)
        const selected = shuffled[0]
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

  const unusedCandidates = candidates.filter(m => !usedMealIds.has(m.id))
  if (unusedCandidates.length > 0) {
    candidates = unusedCandidates
  }

  if (candidates.length === 0) return null

  const shuffled = shuffle(candidates)
  return shuffled[0]
}
