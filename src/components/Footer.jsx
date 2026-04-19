import logo from "../assets/logo.png"
import { useTranslation } from 'react-i18next'

function Footer() {
  const { i18n, t } = useTranslation()
  return (
    <footer className="footer">
      <img src={logo} alt="Moneylook" className="footer-logo" />

      <p className="footer-text">
        {t('footer.developpedBy')}{" "}
        <a
          href="https://github.com/loguilhem/"
          target="_blank"
          rel="noopener noreferrer"
        >
          loguilhem
        </a>{" "}
        — licence MIT
      </p>
    </footer>
  )
}

export default Footer