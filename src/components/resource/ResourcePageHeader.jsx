import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileImport, faRotate, faSquarePlus } from '@fortawesome/free-solid-svg-icons'
import { Loader } from './Loader'

function ResourcePageHeader({ canImport, extraActions = null, loading, resource, onCreate, onImport, onReload }) {
  return (
    <header className="page-header">
      <div>
        <h1>{resource.label}</h1>
      </div>
      <div className="page-actions">
        <button className="secondary-button" disabled={loading} onClick={onReload}>
          {loading ? <Loader label="Chargement" small /> : <FontAwesomeIcon icon={faRotate} />}
        </button>
        {canImport ? (
          <button className="secondary-button" disabled={loading} onClick={onImport}>
            <FontAwesomeIcon icon={faFileImport} />
          </button>
        ) : null}
        {extraActions}
        <button className="primary-button page-add-button" disabled={loading} onClick={onCreate}>
          <FontAwesomeIcon icon={faSquarePlus} />
        </button>
      </div>
    </header>
  )
}

export default ResourcePageHeader
