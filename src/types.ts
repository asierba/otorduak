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
  monday: 'M',
  tuesday: 'T',
  wednesday: 'W',
  thursday: 'T',
  friday: 'F',
  saturday: 'S',
  sunday: 'S'
}

export const DAY_FULL_LABELS: Record<DayName, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
}

export function getOrderedDays(startDay: DayName): DayName[] {
  const startIndex = DAYS.indexOf(startDay)
  return [...DAYS.slice(startIndex), ...DAYS.slice(0, startIndex)]
}

export const TAG_EMOJIS: Record<string, string> = {
  legumes: '🫘',
  fish: '🐟',
  salad: '🥗',
  'tv-food': '📺',
  special: '🥩',
  'weekday-lunch': '🥙',
  'weekday-dinner': '🍖'
}

export function getTagEmoji(tags: string[]): string {
  for (const tag of tags) {
    if (TAG_EMOJIS[tag]) return TAG_EMOJIS[tag]
  }
  return '🍽️'
}
