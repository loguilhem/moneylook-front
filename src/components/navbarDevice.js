import { useEffect, useState } from 'react'

export const MOBILE_NAVBAR_QUERY = '(max-width: 900px)'

export function isMobileDevice() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia(MOBILE_NAVBAR_QUERY).matches
}

export function useIsMobileDevice() {
  const [isMobile, setIsMobile] = useState(() => isMobileDevice())

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia(MOBILE_NAVBAR_QUERY)

    function handleChange(event) {
      setIsMobile(event.matches)
    }

    setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}
