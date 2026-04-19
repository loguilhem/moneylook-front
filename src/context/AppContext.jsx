import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { resources } from '../resources'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

const AppContext = createContext(null)

async function request(endpoint, options = {}) {
  const headers = {
    ...options.headers,
  }

  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    const message = await response.text()
    const error = new Error(message || `Erreur HTTP ${response.status}`)
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function AppProvider({ children }) {
  const [authUser, setAuthUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const [store, setStore] = useState(() =>
    Object.fromEntries(resources.map((resource) => [resource.key, []]))
  )
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState('')

  const resetStore = useCallback(() => {
    setStore(Object.fromEntries(resources.map((resource) => [resource.key, []])))
  }, [])

  const logout = useCallback(async () => {
    await request('/auth/logout', { method: 'POST' }).catch(() => null)
    setAuthUser(null)
    setHasLoaded(false)
    setError('')
    resetStore()
  }, [resetStore])

  const loadAll = useCallback(async () => {
    if (!authUser) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const entries = await Promise.all(
        resources.map(async (resource) => [resource.key, await request(resource.endpoint)])
      )
      setStore(Object.fromEntries(entries))
    } catch (loadError) {
      if (loadError.status === 401) {
        await logout()
        return
      }
      setError(`Impossible de charger les données: ${loadError.message}`)
    } finally {
      setHasLoaded(true)
      setLoading(false)
    }
  }, [authUser, logout])

  useEffect(() => {
    async function checkAuth() {
      setAuthLoading(true)
      try {
        const user = await request('/auth/me')
        setAuthUser(user)
      } catch {
        setAuthUser(null)
      } finally {
        setAuthChecked(true)
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (authUser) {
      loadAll()
    }
  }, [authUser, loadAll])

  async function login(payload) {
    setAuthLoading(true)
    setAuthError('')

    try {
      const user = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setAuthUser(user)
      setHasLoaded(false)
    } catch (loginError) {
      setAuthError(
        loginError.status === 401
          ? 'Email ou mot de passe incorrect.'
          : loginError.message
      )
      throw loginError
    } finally {
      setAuthChecked(true)
      setAuthLoading(false)
    }
  }

  async function saveResource(resource, payload, id) {
    setError('')

    try {
      await request(id ? `${resource.endpoint}/${id}` : resource.endpoint, {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      })
      await loadAll()
    } catch (saveError) {
      if (saveError.status === 401) {
        await logout()
        return
      }
      setError(`Enregistrement impossible: ${saveError.message}`)
      throw saveError
    }
  }

  async function deleteResource(resource, id) {
    const confirmed = window.confirm(`Supprimer ${resource.singular} #${id} ?`)
    if (!confirmed) {
      return
    }

    setError('')

    try {
      await request(`${resource.endpoint}/${id}`, { method: 'DELETE' })
      await loadAll()
    } catch (deleteError) {
      if (deleteError.status === 401) {
        await logout()
        return
      }
      setError(`Suppression impossible: ${deleteError.message}`)
      throw deleteError
    }
  }

  const counts = useMemo(
    () => Object.fromEntries(resources.map((resource) => [resource.key, store[resource.key]?.length ?? 0])),
    [store]
  )

  const value = {
    authUser,
    authChecked,
    authLoading,
    authError,
    loading,
    hasLoaded,
    error,
    store,
    counts,
    login,
    logout,
    loadAll,
    saveResource,
    deleteResource,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }

  return context
}