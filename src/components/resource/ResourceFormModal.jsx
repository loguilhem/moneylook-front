import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faSquarePlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import FieldInput from './FieldInput'
import { Loader } from './Loader'

function ResourceFormModal({ resource, form, lookups, editingId, saving, onChange, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-panel" aria-modal="true" role="dialog" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Formulaire</p>
            <h2>{editingId ? `Modifier #${editingId}` : `Ajouter ${resource.singular}`}</h2>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-grid modal-form-grid">
            {resource.fields.map((field) => (
              <label key={field.name}>
                <span>{field.label}</span>
                <FieldInput
                  disabled={saving}
                  field={field}
                  currentItemId={editingId}
                  value={form[field.name]}
                  lookups={lookups}
                  onChange={onChange}
                />
              </label>
            ))}
          </div>

          <div className="modal-actions">
            <button
              aria-label="Annuler"
              className="modal-cancel-button"
              disabled={saving}
              title="Annuler"
              type="button"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <button
              aria-label={editingId ? 'Modifier' : 'Créer'}
              className="primary-button modal-submit-button"
              disabled={saving}
              title={editingId ? 'Modifier' : 'Créer'}
              type="submit"
            >
              {saving ? <Loader label="Enregistrement" /> : <FontAwesomeIcon icon={editingId ? faPenToSquare : faSquarePlus} />}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ResourceFormModal
