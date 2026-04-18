import logo from '../assets/logo.png'
import { resources } from '../resources'
import { pathFromPage } from '../routing'

function Navbar({ current, onLogout, onNavigate }) {
  function handleNavigation(event, pageKey) {
    event.preventDefault()
    onNavigate(pageKey)
  }

  return (
    <nav className="navbar" aria-label="Navigation principale">
      <a className="brand" href={pathFromPage('home')} onClick={(event) => handleNavigation(event, 'home')}>
        <img className="brand-logo" src={logo} alt="" />
        <span>Moneylook</span>
      </a>
      <div className="nav-links">
        <a
          className={current === 'stats' ? 'active' : ''}
          href={pathFromPage('stats')}
          onClick={(event) => handleNavigation(event, 'stats')}
        >
          Stats
        </a>
        {resources.map((resource) => (
          <a
            className={current === resource.key ? 'active' : ''}
            href={pathFromPage(resource.key)}
            key={resource.key}
            onClick={(event) => handleNavigation(event, resource.key)}
          >
            {resource.label}
          </a>
        ))}
        <button className="logout-button" onClick={onLogout}>
          Déconnexion
        </button>
      </div>
    </nav>
  )
}

export default Navbar
