import { useTranslation } from 'react-i18next'

function SessionLoader() {
  const { t } = useTranslation()

  return (
    <main className="login-page">
      <p className="inline-loader">
        <span className="loader-spinner" aria-hidden="true" />
        {t('session.checkingSession')}
      </p>
    </main>
  )
}

export default SessionLoader
