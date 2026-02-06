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

const WEEKDAYS: DayName[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

function getCandidates(meals: Meal[], day: DayName, mealType: MealType): Meal[] {
  const rule = getRuleForSlot(day, mealType)
  if (rule) {
    return meals.filter(meal => meal.tags.includes(rule.requiredTag))
  }

  if (WEEKDAYS.includes(day) && mealType === 'lunch') {
    return meals.filter(meal => meal.tags.includes('weekday-lunch'))
  }

  if (WEEKDAYS.includes(day) && mealType === 'dinner') {
    return meals.filter(meal => meal.tags.includes('weekday-dinner'))
  }

  return []
}

function createEmptyWeekPlan(): WeekPlan {
  const plan: Partial<WeekPlan> = {}
  for (const day of DAYS) {
    plan[day] = { lunch: null, dinner: null }
  }
  return plan as WeekPlan
}

export function generateWeekPlan(meals: Meal[]): WeekPlan {
  const usedMealNames = new Set<string>()
  const plan = createEmptyWeekPlan()

  for (const day of DAYS) {
    for (const mealType of ['lunch', 'dinner'] as const) {
      const candidates = getCandidates(meals, day, mealType)
        .filter(m => !usedMealNames.has(m.name))

      if (candidates.length > 0) {
        const shuffled = shuffle(candidates)
        const selected = shuffled[0]
        plan[day][mealType] = selected
        usedMealNames.add(selected.name)
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
  currentMealName?: string
): Meal | null {
  let candidates = getCandidates(meals, day, mealType)

  if (currentMealName) {
    candidates = candidates.filter(m => m.name !== currentMealName)
  }

  const usedMealNames = new Set<string>()
  for (const d of DAYS) {
    const dayPlan = currentPlan[d]
    if (dayPlan.lunch && !(d === day && mealType === 'lunch')) {
      usedMealNames.add(dayPlan.lunch.name)
    }
    if (dayPlan.dinner && !(d === day && mealType === 'dinner')) {
      usedMealNames.add(dayPlan.dinner.name)
    }
  }

  candidates = candidates.filter(m => !usedMealNames.has(m.name))

  if (candidates.length === 0) return null

  const shuffled = shuffle(candidates)
  return shuffled[0]
}
