import type { MealType } from '../types'

export interface FrequencyRule {
  tag: string
  mealType: MealType
  count: number
}

export const FREQUENCY_RULES: FrequencyRule[] = [
  { tag: 'fish', mealType: 'dinner', count: 2 },
  { tag: 'legumes', mealType: 'lunch', count: 1 },
]
