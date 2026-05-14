export function registerServiceWorker() {
  const shouldRegister = !import.meta.env.DEV || import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true'

  if (!('serviceWorker' in navigator) || !shouldRegister) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.warn('Service worker registration failed:', error)
    })
  })
}
