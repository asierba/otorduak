import { useState, useEffect, useCallback } from 'react'
import type { WeekPlan } from '../types'
import { getFrozenMealsForTomorrow, shouldSendNotification, getTodayDateString } from '../utils/defrostCheck'
import { idbSet } from '../utils/idbStorage'

const NOTIFICATIONS_ENABLED_KEY = 'otorduak-notifications-enabled'
const LAST_NOTIFICATION_KEY = 'otorduak-last-defrost-notification'

type PermissionState = NotificationPermission | 'unsupported'

async function registerPeriodicSync() {
  try {
    const reg = await navigator.serviceWorker?.ready
    if (reg && 'periodicSync' in reg) {
      await (reg.periodicSync as PeriodicSyncManager).register('defrost-check', {
        minInterval: 12 * 60 * 60 * 1000, // 12 hours
      })
    }
  } catch {
    // Periodic sync not available or permission denied — fall back to app-open checks
  }
}

async function unregisterPeriodicSync() {
  try {
    const reg = await navigator.serviceWorker?.ready
    if (reg && 'periodicSync' in reg) {
      await (reg.periodicSync as PeriodicSyncManager).unregister('defrost-check')
    }
  } catch {
    // Ignore
  }
}

interface PeriodicSyncManager {
  register(tag: string, options?: { minInterval?: number }): Promise<void>
  unregister(tag: string): Promise<void>
}

export function useDefrostNotifications(
  weekPlan: WeekPlan | null,
  frozenMealNames: Set<string>
) {
  const [enabled, setEnabledState] = useState<boolean>(() =>
    localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === 'true'
  )
  const [permissionState, setPermissionState] = useState<PermissionState>(() => {
    if (typeof Notification === 'undefined') return 'unsupported'
    return Notification.permission
  })

  // Mirror data to IndexedDB for the service worker
  useEffect(() => {
    if (weekPlan) {
      idbSet('week-plan', weekPlan)
    }
  }, [weekPlan])

  useEffect(() => {
    idbSet('frozen-meal-names', [...frozenMealNames])
  }, [frozenMealNames])

  useEffect(() => {
    idbSet('notifications-enabled', enabled)
  }, [enabled])

  const checkAndNotify = useCallback(async () => {
    if (!enabled || !weekPlan || frozenMealNames.size === 0) return
    if (permissionState !== 'granted') return

    const lastDate = localStorage.getItem(LAST_NOTIFICATION_KEY)
    if (!shouldSendNotification(lastDate)) return

    const frozenTomorrow = getFrozenMealsForTomorrow(weekPlan, frozenMealNames)
    if (frozenTomorrow.length === 0) return

    const body = frozenTomorrow.length === 1
      ? `Take out "${frozenTomorrow[0]}" from the freezer for tomorrow`
      : `Take out from the freezer for tomorrow:\n${frozenTomorrow.map(m => `• ${m}`).join('\n')}`

    try {
      const reg = await navigator.serviceWorker?.ready
      if (reg) {
        await reg.showNotification('🧊 Defrost reminder', {
          body,
          icon: '/icon-192.png',
          tag: 'defrost-reminder',
        })
      }
    } catch {
      new Notification('🧊 Defrost reminder', {
        body,
        icon: '/icon-192.png',
        tag: 'defrost-reminder',
      })
    }

    localStorage.setItem(LAST_NOTIFICATION_KEY, getTodayDateString())
    await idbSet('last-defrost-notification', getTodayDateString())
  }, [enabled, weekPlan, frozenMealNames, permissionState])

  const setEnabled = useCallback(async (value: boolean) => {
    if (value) {
      if (typeof Notification === 'undefined') {
        setPermissionState('unsupported')
        return
      }
      const permission = await Notification.requestPermission()
      setPermissionState(permission)
      if (permission !== 'granted') return
      registerPeriodicSync()
    } else {
      unregisterPeriodicSync()
    }
    setEnabledState(value)
    localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(value))
  }, [])

  // Check on mount
  useEffect(() => {
    checkAndNotify()
  }, [checkAndNotify])

  // Check on visibility change (user switches back to app)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        checkAndNotify()
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [checkAndNotify])

  return {
    notificationsEnabled: enabled,
    setNotificationsEnabled: setEnabled,
    permissionState,
  }
}
