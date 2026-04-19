import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from 'react-i18next'

const REMEMBERED_LOGIN_KEY = 'moneylook-remembered-login'

function getRememberedLogin() {
  const rememberedLogin = localStorage.getItem(REMEMBERED_LOGIN_KEY)

  if (!rememberedLogin) {
    return null
  }

  try {
    return JSON.parse(rememberedLogin)
  } catch {
    localStorage.removeItem(REMEMBERED_LOGIN_KEY)
    return null
  }
}

function LoginPage() {
  const navigate = useNavigate()
  const { login, authError, authLoading } = useAppContext()
  const [rememberMe, setRememberMe] = useState(() => Boolean(getRememberedLogin()))
  const [form, setForm] = useState(() => {
    const rememberedLogin = getRememberedLogin()

    return {
      email: rememberedLogin?.email ?? '',
      password: rememberedLogin?.password ?? '',
    }
  })
  const { t } = useTranslation()

  async function submit(event) {
    event.preventDefault()

    try {
      await login(form)

      if (rememberMe) {
        localStorage.setItem(REMEMBERED_LOGIN_KEY, JSON.stringify(form))
      } else {
        localStorage.removeItem(REMEMBERED_LOGIN_KEY)
      }

      navigate('/', { replace: true })
    } catch {
      // le message est déjà géré dans le contexte
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <h1>{t('login.login')}</h1>

        {authError ? <p className="alert">{authError}</p> : null}

        <form className="form-grid" onSubmit={submit}>
          <label>
            <span>{t('login.email')}</span>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>

          <label>
            <span>{t('login.password')}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>{t('login.rememberMe')}</span>
          </label>

          <button className="primary-button" disabled={authLoading} type="submit">
            {authLoading ? t('login.logging') : t('login.login')}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
