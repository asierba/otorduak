import { useState, useEffect, useCallback } from 'react'
import type { WeekPlan } from '../types'
import { getFrozenMealsForTomorrow, shouldSendNotification, getTodayDateString } from '../utils/defrostCheck'

const NOTIFICATIONS_ENABLED_KEY = 'otorduak-notifications-enabled'
const LAST_NOTIFICATION_KEY = 'otorduak-last-defrost-notification'

type PermissionState = NotificationPermission | 'unsupported'

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
      // Fallback to regular notification if service worker isn't available
      new Notification('🧊 Defrost reminder', {
        body,
        icon: '/icon-192.png',
        tag: 'defrost-reminder',
      })
    }

    localStorage.setItem(LAST_NOTIFICATION_KEY, getTodayDateString())
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
