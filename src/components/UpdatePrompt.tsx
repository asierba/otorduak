import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update()
      })
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg sm:left-auto sm:right-4 sm:w-auto">
      <span>New version available</span>
      <button
        onClick={() => updateServiceWorker()}
        className="rounded-md bg-blue-500 px-3 py-1 font-medium hover:bg-blue-400 active:bg-blue-600"
      >
        Update
      </button>
    </div>
  )
}
