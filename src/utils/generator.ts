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

const THERMOMIX_TAG = 'thermomix'

function isThermomix(meal: Meal | null): boolean {
  return meal !== null && meal.tags.includes(THERMOMIX_TAG)
}

/**
 * Dinner on day N and lunch on day N+1 are cooked together.
 * If one is a thermomix meal, the other should not be.
 * This rule only applies on weekdays (Mon-Fri). Weekend pairs are exempt:
 * Friday dinner + Saturday lunch and Saturday dinner + Sunday lunch are fine.
 */
function getPairedMeal(plan: WeekPlan, day: DayName, mealType: MealType): Meal | null {
  const dayIndex = DAYS.indexOf(day)
  if (mealType === 'lunch' && dayIndex > 0) {
    const prevDay = DAYS[dayIndex - 1]
    // Skip if either day is a weekend day
    if (!WEEKDAYS.includes(prevDay) || !WEEKDAYS.includes(day)) return null
    return plan[prevDay].dinner
  }
  if (mealType === 'dinner' && dayIndex < DAYS.length - 1) {
    const nextDay = DAYS[dayIndex + 1]
    // Skip if either day is a weekend day
    if (!WEEKDAYS.includes(day) || !WEEKDAYS.includes(nextDay)) return null
    return plan[nextDay].lunch
  }
  return null
}

function excludeThermomixIfNeeded(candidates: Meal[], plan: WeekPlan, day: DayName, mealType: MealType): Meal[] {
  const paired = getPairedMeal(plan, day, mealType)
  if (isThermomix(paired)) {
    return candidates.filter(m => !m.tags.includes(THERMOMIX_TAG))
  }
  return candidates
}

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

export interface GenerateResult {
  plan: WeekPlan
  placedFrozenNames: Set<string>
  unplacedFrozenNames: string[]
  unplacedPinnedNames: string[]
}

function placePreSelected(
  preSelected: Meal[],
  allMeals: Meal[],
  plan: WeekPlan,
  usedMealNames: Set<string>,
): { placed: Set<string>; unplaced: string[] } {
  const placed = new Set<string>()
  const unplaced: string[] = []

  for (const meal of shuffle(preSelected)) {
    if (usedMealNames.has(meal.name)) {
      unplaced.push(meal.name)
      continue
    }
    const validSlots: { day: DayName; mealType: MealType }[] = []
    for (const day of DAYS) {
      for (const mealType of ['lunch', 'dinner'] as const) {
        if (plan[day][mealType] !== null) continue
        const candidates = excludeThermomixIfNeeded(
          getCandidates(allMeals, day, mealType), plan, day, mealType
        )
        if (candidates.some(c => c.name === meal.name)) {
          validSlots.push({ day, mealType })
        }
      }
    }
    if (validSlots.length > 0) {
      const slot = shuffle(validSlots)[0]
      plan[slot.day][slot.mealType] = meal
      usedMealNames.add(meal.name)
      placed.add(meal.name)
    } else {
      unplaced.push(meal.name)
    }
  }

  return { placed, unplaced }
}

export function generateWeekPlan(
  meals: Meal[],
  frozenMeals: Meal[] = [],
  pinnedMeals: Meal[] = [],
): GenerateResult {
  const usedMealNames = new Set<string>()
  const plan = createEmptyWeekPlan()

  const frozen = placePreSelected(frozenMeals, meals, plan, usedMealNames)
  const pinned = placePreSelected(pinnedMeals, meals, plan, usedMealNames)

  // Randomize the order in which we fill slots to avoid bias
  // (e.g. Monday always getting first pick from the pool)
  const emptySlots: { day: DayName; mealType: MealType }[] = []
  for (const day of DAYS) {
    for (const mealType of ['lunch', 'dinner'] as const) {
      if (plan[day][mealType] === null) {
        emptySlots.push({ day, mealType })
      }
    }
  }

  for (const { day, mealType } of shuffle(emptySlots)) {
    if (plan[day][mealType] !== null) continue
    const candidates = excludeThermomixIfNeeded(
      getCandidates(meals, day, mealType).filter(m => !usedMealNames.has(m.name)),
      plan, day, mealType
    )

    if (candidates.length > 0) {
      const shuffled = shuffle(candidates)
      const selected = shuffled[0]
      plan[day][mealType] = selected
      usedMealNames.add(selected.name)
    }
  }

  return {
    plan,
    placedFrozenNames: frozen.placed,
    unplacedFrozenNames: frozen.unplaced,
    unplacedPinnedNames: pinned.unplaced,
  }
}

/**
 * Returns a set of "day:mealType" keys for slots that violate the Thermomix rule.
 * A violation occurs when both meals in a weekday pair (dinner N + lunch N+1)
 * are Thermomix meals.
 */
export function getThermomixViolations(plan: WeekPlan): Set<string> {
  const violations = new Set<string>()
  for (let i = 0; i < WEEKDAYS.length - 1; i++) {
    const dinnerDay = WEEKDAYS[i]
    const lunchDay = WEEKDAYS[i + 1]
    if (isThermomix(plan[dinnerDay].dinner) && isThermomix(plan[lunchDay].lunch)) {
      violations.add(`${dinnerDay}:dinner`)
      violations.add(`${lunchDay}:lunch`)
    }
  }
  return violations
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

  // Try with all constraints first (no duplicates in week + thermomix rule)
  let filtered = candidates.filter(m => !usedMealNames.has(m.name))
  filtered = excludeThermomixIfNeeded(filtered, currentPlan, day, mealType)

  // If too few options, relax the "used in week" constraint but keep thermomix rule
  if (filtered.length < 2) {
    const relaxed = excludeThermomixIfNeeded(candidates, currentPlan, day, mealType)
    if (relaxed.length > filtered.length) {
      filtered = relaxed
    }
  }

  if (filtered.length === 0) return null

  const shuffled = shuffle(filtered)
  return shuffled[0]
}
