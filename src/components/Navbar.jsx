import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faChartLine, faCoins, faGear, faHandHoldingDollar, faHouse, faMoon, faRightFromBracket, faRoute, faSun, faXmark } from '@fortawesome/free-solid-svg-icons'
import logo from '../assets/logo.png'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from 'react-i18next'

function Navbar({ onStartTour }) {
  const { logout, theme, toggleTheme } = useAppContext()
  const { i18n, t } = useTranslation()
  const location = useLocation()
  const settingsMenuRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const settingsPaths = [
    '/resource/categories',
    '/resource/recurring-expenses',
    '/resource/recurring-incomes',
    '/resource/bank-accounts',
    '/resource/account-types',
  ]
  const isSettingsActive = settingsPaths.some((path) => location.pathname === path)

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value)
  }

  const closeSettingsMenu = () => {
    if (settingsMenuRef.current) {
      settingsMenuRef.current.open = false
    }
  }

  const closeMobileMenu = () => {
    setIsMenuOpen(false)
    closeSettingsMenu()
  }

  const startGuidedTour = () => {
    closeMobileMenu()
    onStartTour()
  }

  const handleThemeToggle = () => {
    toggleTheme()
    closeSettingsMenu()
  }

  const handleMobileThemeToggle = () => {
    toggleTheme()
    closeMobileMenu()
  }

  useEffect(() => {
    setIsMenuOpen(false)
    if (settingsMenuRef.current) {
      settingsMenuRef.current.open = false
    }
  }, [location.pathname])

  useEffect(() => {
    function closeSettingsMenuOnOutsideClick(event) {
      if (!settingsMenuRef.current?.contains(event.target)) {
        settingsMenuRef.current.open = false
      }
    }

    document.addEventListener('pointerdown', closeSettingsMenuOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeSettingsMenuOnOutsideClick)
  }, [])

  return (
    <nav className="navbar" aria-label={t('nav.ariaLabel')}>
      <NavLink to="/" className="brand" data-tour="brand">
        <img src={logo} alt="Moneylook" className="brand-logo" />
      </NavLink>

      <button
        className="mobile-menu-toggle"
        type="button"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.ariaLabel')}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
      </button>

      <div className={`nav-menu ${isMenuOpen ? 'is-open' : ''}`}>
        <div className="nav-links">
          <NavLink to="/" className="desktop-nav-link" aria-label={t('nav.home')} title={t('nav.home')} data-tour="nav-home" onClick={closeMobileMenu}>
            <FontAwesomeIcon icon={faHouse} />
          </NavLink>
          <NavLink to="/stats" aria-label={t('nav.stats')} title={t('nav.stats')} data-tour="nav-stats" onClick={closeMobileMenu}>
            <FontAwesomeIcon icon={faChartLine} />
          </NavLink>
          <NavLink to="/resource/incomes" aria-label={t('nav.incomes')} title={t('nav.incomes')} data-tour="nav-incomes" onClick={closeMobileMenu}>
            <FontAwesomeIcon icon={faHandHoldingDollar} />
          </NavLink>
          <NavLink to="/resource/expenses" aria-label={t('nav.expenses')} title={t('nav.expenses')} data-tour="nav-expenses" onClick={closeMobileMenu}>
            <FontAwesomeIcon icon={faCoins} />
          </NavLink>
          <button
            className="mobile-nav-action"
            type="button"
            aria-label={theme === 'light' ? t('nav.switchToDark') : t('nav.switchToLight')}
            title={theme === 'light' ? t('nav.switchToDark') : t('nav.switchToLight')}
            onClick={handleMobileThemeToggle}
          >
            <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
          </button>
          <button className="mobile-nav-action logout-button" type="button" aria-label={t('nav.logout')} title={t('nav.logout')} onClick={logout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>

        <div className="nav-utilities">
          <details className="settings-menu" ref={settingsMenuRef}>
            <summary className={isSettingsActive ? 'active' : ''} aria-label={t('nav.settings')} title={t('nav.settings')} data-tour="nav-settings">
              <FontAwesomeIcon icon={faGear} />
            </summary>
            <div className="settings-menu-panel">
              <NavLink to="/resource/categories" onClick={closeMobileMenu}>{t('nav.categories')}</NavLink>
              <NavLink to="/resource/recurring-expenses" onClick={closeMobileMenu}>{t('nav.recurringExpenses')}</NavLink>
              <NavLink to="/resource/recurring-incomes" onClick={closeMobileMenu}>{t('nav.recurringIncomes')}</NavLink>
              <NavLink to="/resource/bank-accounts" onClick={closeMobileMenu}>{t('nav.bankAccounts')}</NavLink>
              <NavLink to="/resource/account-types" onClick={closeMobileMenu}>{t('nav.accountTypes')}</NavLink>
              <button className="settings-menu-action" type="button" onClick={handleThemeToggle}>
                <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
                <span>{theme === 'light' ? t('nav.switchToDark') : t('nav.switchToLight')}</span>
              </button>
              <button className="settings-menu-action" type="button" onClick={startGuidedTour}>
                <FontAwesomeIcon icon={faRoute} />
                <span>{t('nav.startTour')}</span>
              </button>
            </div>
          </details>
          <label className="language-select-label" data-tour="nav-language">
            <span className="sr-only">{t('nav.language')}</span>
            <select
              className="language-select"
              value={i18n.resolvedLanguage || i18n.language}
              onChange={handleLanguageChange}
              aria-label={t('nav.language')}
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="it">IT</option>
              <option value="de">DE</option>
            </select>
          </label>
          <button className="logout-button" aria-label={t('nav.logout')} title={t('nav.logout')} onClick={logout} data-tour="nav-logout">
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
