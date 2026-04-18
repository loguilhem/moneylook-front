import { useMemo, useState } from 'react'
import logo from '../assets/logo.png'

const REMEMBERED_EMAIL_KEY = 'moneylook.rememberedEmail'

function createCaptcha() {
  const left = Math.floor(Math.random() * 8) + 2
  const right = Math.floor(Math.random() * 8) + 2

  return {
    answer: left + right,
    question: `${left} + ${right}`,
  }
}

function LoginPage({ error, loading, onLogin }) {
  const rememberedEmail = useMemo(() => localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '', [])
  const [email, setEmail] = useState(rememberedEmail)
  const [password, setPassword] = useState('')
  const [rememberUser, setRememberUser] = useState(Boolean(rememberedEmail))
  const [captcha, setCaptcha] = useState(() => createCaptcha())
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaError, setCaptchaError] = useState('')

  function resetCaptcha() {
    setCaptcha(createCaptcha())
    setCaptchaAnswer('')
  }

  function submit(event) {
    event.preventDefault()

    if (Number(captchaAnswer) !== captcha.answer) {
      setCaptchaError('Captcha incorrect.')
      resetCaptcha()
      return
    }

    setCaptchaError('')
    if (rememberUser) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY)
    }

    onLogin({ email, password })
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <img className="login-logo" src={logo} alt="Moneylook" />
        <p className="eyebrow">Moneylook</p>
        <h1>Connexion</h1>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label>
              <span>Email</span>
              <input
                autoComplete="email"
                type="email"
                value={email}
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              <span>Mot de passe</span>
              <input
                autoComplete="current-password"
                type="password"
                value={password}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberUser}
                onChange={(event) => setRememberUser(event.target.checked)}
              />
              <span>Se souvenir de l'utilisateur</span>
            </label>
            <label>
              <span>Captcha simple: {captcha.question}</span>
              <input
                inputMode="numeric"
                type="number"
                value={captchaAnswer}
                required
                onChange={(event) => setCaptchaAnswer(event.target.value)}
              />
            </label>
          </div>
          {captchaError ? <p className="alert">{captchaError}</p> : null}
          {error ? <p className="alert">{error}</p> : null}
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? (
              <span className="loader-label">
                <span className="loader-spinner" aria-hidden="true" />
                Connexion
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
