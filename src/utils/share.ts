import type { WeekPlan, DayName, Meal } from '../types'
import { DAYS } from '../types'

type CompactPlan = Record<string, { lunch: string | null; dinner: string | null }>

export function serializeWeekPlan(weekPlan: WeekPlan): string {
  const compact: CompactPlan = {}
  for (const day of DAYS) {
    compact[day] = {
      lunch: weekPlan[day].lunch?.name ?? null,
      dinner: weekPlan[day].dinner?.name ?? null,
    }
  }
  return btoa(JSON.stringify(compact))
}

export function deserializeWeekPlan(encoded: string, meals: Meal[]): WeekPlan | null {
  try {
    const compact: CompactPlan = JSON.parse(atob(encoded))
    const mealsByName = new Map(meals.map(m => [m.name, m]))
    const plan: Partial<WeekPlan> = {}
    for (const day of DAYS) {
      const dayData = compact[day as DayName]
      if (!dayData) return null
      plan[day as DayName] = {
        lunch: dayData.lunch ? (mealsByName.get(dayData.lunch) ?? null) : null,
        dinner: dayData.dinner ? (mealsByName.get(dayData.dinner) ?? null) : null,
      }
    }
    return plan as WeekPlan
  } catch {
    return null
  }
}
