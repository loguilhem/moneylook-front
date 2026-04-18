import logo from '../assets/logo.png'
import { homePages } from '../resources'
import { pathFromPage } from '../routing'

function HomePage({ onLogout, onNavigate, counts, error, loading }) {
  function handleNavigation(event, pageKey) {
    event.preventDefault()
    onNavigate(pageKey)
  }

  return (
    <main className="home-page">
      <section className="home-heading">
        <img className="home-logo" src={logo} alt="Moneylook" />
        <p className="eyebrow">Moneylook</p>
        <h1>Gestion des dépenses</h1>
        <p>Choisis une page pour consulter, créer, modifier ou supprimer tes données.</p>
      </section>

      {error ? <p className="alert">{error}</p> : null}
      {loading ? (
        <p className="inline-loader">
          <span className="loader-spinner" aria-hidden="true" />
          Chargement des pages
        </p>
      ) : null}

      <section className="card-grid" aria-label="Pages disponibles">
        {homePages.map((page) => (
          <a
            className="home-card"
            href={pathFromPage(page.key)}
            key={page.key}
            onClick={(event) => handleNavigation(event, page.key)}
          >
            <span>{page.label}</span>
            <strong>{page.countLabel ?? counts[page.key] ?? '-'}</strong>
            <p>{page.description}</p>
          </a>
        ))}
        <button className="home-card logout-card" onClick={onLogout}>
          <span>Déconnexion</span>
          <strong>Off</strong>
          <p>Fermer la session sur cet appareil.</p>
        </button>
      </section>
    </main>
  )
}

export default HomePage
