import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from 'react-i18next'

function Navbar() {
  const { logout } = useAppContext()
  const { i18n, t } = useTranslation()

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value)
  }

  return (
    <nav className="navbar" aria-label={t('nav.ariaLabel')}>
      <NavLink to="/" className="brand">
        <img src={logo} alt="Moneylook" className="brand-logo" />
      </NavLink>

      <div className="nav-links">
        <NavLink to="/">{t('nav.home')}</NavLink>
        <NavLink to="/stats">{t('nav.stats')}</NavLink>
        <NavLink to="/resource/categories">{t('nav.categories')}</NavLink>
        <NavLink to="/resource/expenses">{t('nav.expenses')}</NavLink>
        <NavLink to="/resource/recurring-expenses">{t('nav.recurringExpenses')}</NavLink>
        <NavLink to="/resource/incomes">{t('nav.incomes')}</NavLink>
        <NavLink to="/resource/recurring-incomes">{t('nav.recurringIncomes')}</NavLink>
        <NavLink to="/resource/bank-accounts">{t('nav.bankAccounts')}</NavLink>
        <NavLink to="/resource/account-types">{t('nav.accountTypes')}</NavLink>
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
        <button className="logout-button" onClick={logout}>
          {t('nav.logout')}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
