import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileImport, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Loader } from './Loader'

function ImportSummary({ summary }) {
  return (
    <section className="import-summary">
      <h3>Résumé</h3>
      <p>
        {summary.inserted.length} insertion(s), {summary.refused.length} refus, {summary.total} ligne(s) lue(s).
      </p>

      {summary.inserted.length > 0 ? (
        <>
          <h4>Insertions</h4>
          <ul>
            {summary.inserted.map((item) => (
              <li key={`inserted-${item.rowNumber}`}>
                Ligne {item.rowNumber}: {item.value}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {summary.refused.length > 0 ? (
        <>
          <h4>Refus</h4>
          <ul>
            {summary.refused.map((item) => (
              <li key={`refused-${item.rowNumber}`}>
                Ligne {item.rowNumber}: {item.reasons.join(', ')}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  )
}

function ResourceImportModal({ resource, importing, summary, onClose, onImport }) {
  const [file, setFile] = useState(null)

  function submit(event) {
    event.preventDefault()
    if (file) {
      onImport(file)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-panel import-modal-panel" aria-modal="true" role="dialog" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Import</p>
            <h2><FontAwesomeIcon icon={faFileImport} /> {resource.label}</h2>
          </div>
        </div>

        <form onSubmit={submit}>
          <p className="import-help">
            Le fichier doit contenir une ligne d'en-tête avec exactement les noms de champs BDD :
            {' '}
            {resource.fields.map((field) => field.name).join(', ')}.
            {' '}
            Les montants se saisissent en unités principales, par exemple 12.50, même si la colonne s'appelle amount_cents.
          </p>
          <input
            accept=".csv,.xlsx,.xls,.ods"
            disabled={importing}
            required
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <div className="modal-actions">
            <button
              aria-label="Annuler"
              className="modal-cancel-button"
              disabled={importing}
              title="Annuler"
              type="button"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <button className="primary-button modal-submit-button" disabled={importing || !file} type="submit">
              {importing ? <Loader label="Import" /> : <FontAwesomeIcon icon={faFileImport} />}
            </button>
          </div>
        </form>

        {summary ? <ImportSummary summary={summary} /> : null}
      </section>
    </div>
  )
}

export default ResourceImportModal
