import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faChartLine, faCoins, faHandHoldingDollar, faMoon, faRightFromBracket, faSun, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.png'
import { useAppContext } from '../context/AppContext'

function NavbarMobile() {
  const { logout, theme, toggleTheme } = useAppContext()
  const { t } = useTranslation()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  function closeMobileMenu() {
    setIsMenuOpen(false)
  }

  function handleThemeToggle() {
    toggleTheme()
    closeMobileMenu()
  }

  function handleLogout() {
    logout()
    closeMobileMenu()
  }

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function closeMenuOnOutsideClick(event) {
      if (isMenuOpen && !menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeMenuOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeMenuOnOutsideClick)
  }, [isMenuOpen])

  return (
    <nav className="navbar" aria-label={t('nav.ariaLabel')} ref={menuRef}>
      <NavLink to="/" className="brand" data-tour="brand" onClick={closeMobileMenu}>
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
            onClick={handleThemeToggle}
          >
            <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
          </button>
          <button className="mobile-nav-action logout-button" type="button" aria-label={t('nav.logout')} title={t('nav.logout')} onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavbarMobile
