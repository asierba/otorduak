import type { DayName, MealType } from '../types'

export interface SlotRule {
  day: DayName
  mealType: MealType
  requiredTag: string
}

export const RULES: SlotRule[] = [
  { day: 'tuesday', mealType: 'lunch', requiredTag: 'legumes' },
  { day: 'tuesday', mealType: 'dinner', requiredTag: 'fish' },
  { day: 'wednesday', mealType: 'dinner', requiredTag: 'salad' },
  { day: 'thursday', mealType: 'dinner', requiredTag: 'fish' },
  { day: 'friday', mealType: 'dinner', requiredTag: 'tv-food' },
  { day: 'saturday', mealType: 'lunch', requiredTag: 'special' },
  { day: 'saturday', mealType: 'dinner', requiredTag: 'tv-food' },
  { day: 'sunday', mealType: 'lunch', requiredTag: 'special' },
  { day: 'sunday', mealType: 'dinner', requiredTag: 'tv-food' },
]

export function getRuleForSlot(day: DayName, mealType: MealType): SlotRule | undefined {
  return RULES.find(r => r.day === day && r.mealType === mealType)
}
