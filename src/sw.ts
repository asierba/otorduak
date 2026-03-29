/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { idbGet } from './utils/idbStorage'
import { getFrozenMealsForTomorrow, shouldSendNotification, getTodayDateString } from './utils/defrostCheck'
import type { WeekPlan } from './types'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      return self.clients.openWindow('/')
    })
  )
})

async function checkAndNotifyFromIDB() {
  const enabled = await idbGet<boolean>('notifications-enabled')
  if (!enabled) return

  const lastDate = await idbGet<string>('last-defrost-notification')
  if (!shouldSendNotification(lastDate ?? null)) return

  const weekPlan = await idbGet<WeekPlan>('week-plan')
  const frozenNames = await idbGet<string[]>('frozen-meal-names')
  if (!weekPlan || !frozenNames || frozenNames.length === 0) return

  const frozenTomorrow = getFrozenMealsForTomorrow(weekPlan, new Set(frozenNames))
  if (frozenTomorrow.length === 0) return

  const body = frozenTomorrow.length === 1
    ? `Take out "${frozenTomorrow[0]}" from the freezer for tomorrow`
    : `Take out from the freezer for tomorrow:\n${frozenTomorrow.map(m => `• ${m}`).join('\n')}`

  await self.registration.showNotification('🧊 Defrost reminder', {
    body,
    icon: '/icon-192.png',
    tag: 'defrost-reminder',
  })

  const { idbSet } = await import('./utils/idbStorage')
  await idbSet('last-defrost-notification', getTodayDateString())
}

interface PeriodicSyncEvent extends ExtendableEvent {
  tag: string
}

self.addEventListener('periodicsync' as 'fetch', (event: Event) => {
  const syncEvent = event as unknown as PeriodicSyncEvent
  if (syncEvent.tag === 'defrost-check') {
    syncEvent.waitUntil(checkAndNotifyFromIDB())
  }
})
