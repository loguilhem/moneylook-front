import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.png'

const REMEMBERED_LOGIN_KEY = 'moneylook-remembered-login'

function getRememberedLogin() {
  const rememberedLogin = localStorage.getItem(REMEMBERED_LOGIN_KEY)

  if (!rememberedLogin) {
    return null
  }

  try {
    const parsedLogin = JSON.parse(rememberedLogin)
    return {
      email: parsedLogin?.email ?? '',
    }
  } catch {
    localStorage.removeItem(REMEMBERED_LOGIN_KEY)
    return null
  }
}

function LoginPage() {
  const navigate = useNavigate()
  const { login, authError, authLoading } = useAppContext()
  const [rememberMe, setRememberMe] = useState(() => Boolean(getRememberedLogin()))
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState(() => {
    const rememberedLogin = getRememberedLogin()

    return {
      email: rememberedLogin?.email ?? '',
      password: '',
    }
  })
  const { t } = useTranslation()

  async function submit(event) {
    event.preventDefault()

    try {
      await login(form)

      if (rememberMe) {
        localStorage.setItem(REMEMBERED_LOGIN_KEY, JSON.stringify({ email: form.email }))
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
      <div className="login-shell">
        <section className="login-logo-panel" aria-label="Moneylook">
          <img src={logo} alt="Moneylook" />
        </section>

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
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  title={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
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
      </div>
    </main>
  )
}

export default LoginPage
