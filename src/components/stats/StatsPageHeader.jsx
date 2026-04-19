import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate } from '@fortawesome/free-solid-svg-icons'

function StatsPageHeader({ loading, onReload, t }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{t('resources.stats.label')}</p>
        <h1>{t('stats.title')}</h1>
      </div>
      <div className="page-actions">
        <button className="secondary-button" disabled={loading} onClick={onReload}>
          {loading ? t('stats.loadingShort') : <FontAwesomeIcon icon={faRotate} />}
        </button>
      </div>
    </header>
  )
}

export default StatsPageHeader
