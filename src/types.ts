export interface Meal {
  id: string
  name: string
  tags: string[]
}

export interface DayPlan {
  lunch: Meal | null
  dinner: Meal | null
}

export type DayName = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type WeekPlan = Record<DayName, DayPlan>

export type MealType = 'lunch' | 'dinner'

export const DAYS: DayName[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const DAY_LABELS: Record<DayName, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
}
