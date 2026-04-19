import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { getHomePages } from '../resources'
import { pathFromPage } from '../routing'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from 'react-i18next'

function HomePage() {
  const { logout, counts, error, loading, hasLoaded } = useAppContext()
  const { t } = useTranslation()
  const homePages = getHomePages(t)

  return (
    <main className="home-page">
      <section className="home-heading">
        <img className="home-logo" src={logo} alt="Moneylook" />
      </section>

      {error ? <p className="alert">{error}</p> : null}
      {loading && !hasLoaded ? (
        <p className="inline-loader">
          <span className="loader-spinner" aria-hidden="true" />
          {t('home.loadingPages')}
        </p>
      ) : null}

      <section className="card-grid" aria-label={t('home.availablePages')}>
        {homePages.map((page) => (
          <Link className="home-card" to={pathFromPage(page.key)} key={page.key}>
            <span>{page.label}</span>
            <strong>{page.countLabel ?? counts[page.key] ?? '-'}</strong>
            <p>{page.description}</p>
          </Link>
        ))}

        <button className="home-card logout-card" onClick={logout}>
          <span>{t('nav.logout')}</span>
          <strong>Off</strong>
          <p>{t('home.logoutDescription')}</p>
        </button>
      </section>
    </main>
  )
}

export default HomePage
