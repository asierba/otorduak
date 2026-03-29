import type { DayName, WeekPlan } from '../types'

const JS_DAY_TO_NAME: DayName[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
]

export function getTomorrowDayName(): DayName {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return JS_DAY_TO_NAME[tomorrow.getDay()]
}

export function getFrozenMealsForTomorrow(
  weekPlan: WeekPlan,
  frozenMealNames: Set<string>
): string[] {
  const tomorrowDay = getTomorrowDayName()
  const dayPlan = weekPlan[tomorrowDay]
  const frozenTomorrow: string[] = []

  if (dayPlan.lunch && frozenMealNames.has(dayPlan.lunch.name)) {
    frozenTomorrow.push(dayPlan.lunch.name)
  }
  if (dayPlan.dinner && frozenMealNames.has(dayPlan.dinner.name)) {
    frozenTomorrow.push(dayPlan.dinner.name)
  }

  return frozenTomorrow
}

export function getTodayDateString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function shouldSendNotification(lastNotificationDate: string | null): boolean {
  return lastNotificationDate !== getTodayDateString()
}
