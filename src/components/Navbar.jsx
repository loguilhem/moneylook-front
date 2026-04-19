import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faCoins, faGear, faHandHoldingDollar, faHouse, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import logo from '../assets/logo.png'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from 'react-i18next'

function Navbar() {
  const { logout } = useAppContext()
  const { i18n, t } = useTranslation()
  const location = useLocation()
  const settingsMenuRef = useRef(null)
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
      <NavLink to="/" className="brand">
        <img src={logo} alt="Moneylook" className="brand-logo" />
      </NavLink>

      <div className="nav-links">
        <NavLink to="/" aria-label={t('nav.home')} title={t('nav.home')}>
          <FontAwesomeIcon icon={faHouse} />
        </NavLink>
        <NavLink to="/stats" aria-label={t('nav.stats')} title={t('nav.stats')}>
          <FontAwesomeIcon icon={faChartLine} />
        </NavLink>
        <NavLink to="/resource/expenses" aria-label={t('nav.expenses')} title={t('nav.expenses')}>
          <FontAwesomeIcon icon={faCoins} />
        </NavLink>
        <NavLink to="/resource/incomes" aria-label={t('nav.incomes')} title={t('nav.incomes')}>
          <FontAwesomeIcon icon={faHandHoldingDollar} />
        </NavLink>
      </div>

      <div className="nav-utilities">
        <details className="settings-menu" ref={settingsMenuRef}>
          <summary className={isSettingsActive ? 'active' : ''} aria-label={t('nav.settings')} title={t('nav.settings')}>
            <FontAwesomeIcon icon={faGear} />
          </summary>
          <div className="settings-menu-panel">
            <NavLink to="/resource/categories" onClick={closeSettingsMenu}>{t('nav.categories')}</NavLink>
            <NavLink to="/resource/recurring-expenses" onClick={closeSettingsMenu}>{t('nav.recurringExpenses')}</NavLink>
            <NavLink to="/resource/recurring-incomes" onClick={closeSettingsMenu}>{t('nav.recurringIncomes')}</NavLink>
            <NavLink to="/resource/bank-accounts" onClick={closeSettingsMenu}>{t('nav.bankAccounts')}</NavLink>
            <NavLink to="/resource/account-types" onClick={closeSettingsMenu}>{t('nav.accountTypes')}</NavLink>
          </div>
        </details>
        <label className="language-select-label">
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
        <button className="logout-button" aria-label={t('nav.logout')} title={t('nav.logout')} onClick={logout}>
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
      </div>
    </nav>
  )
}

export default Navbar
