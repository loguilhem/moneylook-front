import { useCallback, useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import CrudPage from './pages/CrudPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import StatsPage from './pages/StatsPage'
import { resourceByKey, resources } from './resources'
import { pageFromPath, pathFromPage } from './routing'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

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

function App() {
  const [currentPage, setCurrentPage] = useState(() => pageFromPath(window.location.pathname))
  const [authUser, setAuthUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [store, setStore] = useState(() => Object.fromEntries(resources.map((resource) => [resource.key, []])))
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState('')

  const activeResource = resourceByKey[currentPage]

  const logout = useCallback(async () => {
    await request('/auth/logout', { method: 'POST' }).catch(() => null)
    setAuthUser(null)
    setHasLoaded(false)
    setStore(Object.fromEntries(resources.map((resource) => [resource.key, []])))
  }, [])

  const loadAll = useCallback(async () => {
    if (!authUser) {
      return
    }

    setLoading(true)
    setError('')
    try {
      const entries = await Promise.all(resources.map(async (resource) => [resource.key, await request(resource.endpoint)]))
      setStore(Object.fromEntries(entries))
    } catch (loadError) {
      if (loadError.status === 401) {
        await logout()
        setError('')
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

  useEffect(() => {
    function handlePopState() {
      setCurrentPage(pageFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(pageKey) {
    const nextPath = pathFromPage(pageKey)
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
    setCurrentPage(pageKey)
  }

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
      navigate('home')
    } catch (loginError) {
      setAuthError(loginError.status === 401 ? 'Email ou mot de passe incorrect.' : loginError.message)
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

  const counts = Object.fromEntries(resources.map((resource) => [resource.key, store[resource.key]?.length ?? 0]))

  if (!authChecked) {
    return (
      <main className="login-page">
        <p className="inline-loader">
          <span className="loader-spinner" aria-hidden="true" />
          Vérification de la session
        </p>
      </main>
    )
  }

  if (!authUser) {
    return <LoginPage error={authError} loading={authLoading} onLogin={login} />
  }

  if (currentPage === 'stats') {
    return (
      <>
        <Navbar current={currentPage} onLogout={logout} onNavigate={navigate} />
        <StatsPage onUnauthorized={logout} />
      </>
    )
  }

  if (!activeResource) {
    return (
      <HomePage
        counts={counts}
        error={error}
        loading={loading && !hasLoaded}
        onLogout={logout}
        onNavigate={navigate}
      />
    )
  }

  return (
    <>
      <Navbar current={currentPage} onLogout={logout} onNavigate={navigate} />
      <CrudPage
        data={store[activeResource.key] ?? []}
        error={error}
        loading={loading}
        lookups={store}
        resource={activeResource}
        onDelete={deleteResource}
        onReload={loadAll}
        onSave={saveResource}
      />
    </>
  )
}

export default App
