import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrashCan, faSquarePlus, faRotate, faFileImport } from '@fortawesome/free-solid-svg-icons'

const IMPORTABLE_RESOURCE_KEYS = new Set(['recurringIncomes', 'recurringExpenses', 'bankAccounts', 'categories'])
const DEFAULT_CURRENCY = 'CHF'

function centsToMoneyInput(cents) {
  if (cents === null || cents === undefined || cents === '') {
    return ''
  }

  return (Number(cents) / 100).toFixed(2)
}

function moneyInputToCents(value) {
  const normalizedValue = String(value ?? '').trim().replace(',', '.')
  const amount = Number(normalizedValue)

  return Number.isFinite(amount) ? Math.round(amount * 100) : NaN
}

function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  const normalizedValue = normalizeHeader(value)
  return ['1', 'true', 'yes', 'oui', 'active', 'actif'].includes(normalizedValue)
}

function getCurrency(item, lookups) {
  if (!item?.bank_account_id) {
    return DEFAULT_CURRENCY
  }

  return lookups.bankAccounts?.find((account) => account.id === item.bank_account_id)?.currency ?? DEFAULT_CURRENCY
}

function formatMoney(cents, currency = DEFAULT_CURRENCY) {
  const amount = (Number(cents) || 0) / 100

  try {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

function buildEmptyRecord(resource) {
  return resource.fields.reduce((record, field) => {
    record[field.name] = field.defaultValue ?? ''
    return record
  }, {})
}

function normalizePayload(resource, form) {
  return resource.fields.reduce((payload, field) => {
    const value = form[field.name]

    if (field.optional && value === '') {
      payload[field.name] = null
      return payload
    }

    if (field.type === 'money') {
      payload[field.name] = moneyInputToCents(value)
      return payload
    }

    if (field.type === 'boolean') {
      payload[field.name] = toBoolean(value)
      return payload
    }

    if (field.type === 'number' || field.type === 'select') {
      payload[field.name] = Number(value)
      return payload
    }

    payload[field.name] = value
    return payload
  }, {})
}

function itemLabel(item) {
  return item?.label ?? item?.name ?? `#${item?.id}`
}

function formatValue(field, item, lookups) {
  const value = item[field.name]

  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (field.type === 'money') {
    return formatMoney(value, getCurrency(item, lookups))
  }

  if (field.type === 'boolean') {
    return value ? field.trueLabel : field.falseLabel
  }

  const lookupMap = {
    account_type_id: lookups.accountTypes,
    bank_account_id: lookups.bankAccounts,
    category_id: lookups.categories,
  }

  const lookup = lookupMap[field.name]
  if (lookup) {
    const lookupItem = lookup.find((entry) => entry.id === value)
    return lookupItem ? itemLabel(lookupItem) : `#${value}`
  }

  return value
}

function getColumnLabel(resource, column) {
  if (column === 'id') {
    return 'ID'
  }

  if (column === 'icon_preview') {
    return 'Aperçu'
  }

  return resource.fields.find((field) => field.name === column)?.label ?? column
}

function getColumns(resource) {
  const columns = ['id', ...resource.fields.map((field) => field.name)]

  if (resource.key !== 'categories') {
    return columns
  }

  return ['id', 'icon_preview', ...resource.fields.map((field) => field.name)]
}

function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getRowValue(row, field) {
  const expectedKey = normalizeHeader(field.name)
  const rowKey = Object.keys(row).find((key) => normalizeHeader(key) === expectedKey)
  return rowKey ? row[rowKey] : ''
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === ''
}

function formatExcelDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }

  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) {
      return null
    }
    return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`
  }

  const text = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  const date = new Date(text)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString().slice(0, 10)
}

function resolveSelectValue(field, rawValue, lookups) {
  if (isBlank(rawValue)) {
    return ''
  }

  const text = String(rawValue).trim()
  const numericValue = Number(text)
  if (Number.isInteger(numericValue)) {
    const item = lookups[field.source]?.find((entry) => entry.id === numericValue)
    if (item) {
      return String(numericValue)
    }
  }

  const item = lookups[field.source]?.find((entry) => normalizeHeader(itemLabel(entry)) === normalizeHeader(text))
  return item ? String(item.id) : null
}

function resolveStaticSelectValue(field, rawValue) {
  if (isBlank(rawValue)) {
    return ''
  }

  const text = normalizeHeader(rawValue)
  const option = field.options?.find(
    (entry) => normalizeHeader(entry.value) === text || normalizeHeader(entry.label) === text,
  )
  return option ? option.value : null
}

function normalizeImportValue(field, rawValue, lookups) {
  if (field.optional && isBlank(rawValue)) {
    return ''
  }

  if (isBlank(rawValue)) {
    return null
  }

  if (field.type === 'money') {
    const value = moneyInputToCents(rawValue)
    return Number.isFinite(value) ? centsToMoneyInput(value) : null
  }

  if (field.type === 'boolean') {
    return toBoolean(rawValue)
  }

  if (field.type === 'number') {
    const value = Number(rawValue)
    return Number.isFinite(value) ? String(value) : null
  }

  if (field.type === 'date') {
    return formatExcelDate(rawValue)
  }

  if (field.type === 'select') {
    return resolveSelectValue(field, rawValue, lookups)
  }

  if (field.type === 'static-select') {
    return resolveStaticSelectValue(field, rawValue)
  }

  if (field.type === 'color') {
    const value = String(rawValue).trim()
    return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : null
  }

  return String(rawValue).trim()
}

function getUniqueFieldName(resource) {
  return resource.fields.some((field) => field.name === 'name') ? 'name' : 'label'
}

function validateImportRow(row, rowNumber, resource, lookups, existingValues) {
  const form = buildEmptyRecord(resource)
  const reasons = []

  resource.fields.forEach((field) => {
    const rawValue = getRowValue(row, field)
    const normalizedValue = normalizeImportValue(field, rawValue, lookups)

    if (!field.optional && isBlank(rawValue)) {
      reasons.push(`${field.label} manquant`)
      return
    }

    if (normalizedValue === null) {
      reasons.push(`${field.label} mal formaté`)
      return
    }

    form[field.name] = normalizedValue
  })

  const uniqueFieldName = getUniqueFieldName(resource)
  const uniqueValue = normalizeHeader(form[uniqueFieldName])
  if (!uniqueValue) {
    reasons.push(`${uniqueFieldName} manquant`)
  } else if (existingValues.has(uniqueValue)) {
    reasons.push(`${uniqueFieldName} existe déjà`)
  }

  return {
    form,
    reasons,
    rowNumber,
    uniqueValue,
  }
}

async function readImportFile(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { cellDates: true })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    return []
  }

  return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    defval: '',
  })
}

function CrudPage({ resource, data, lookups, loading, error, onReload, onSave, onDelete }) {
  const [form, setForm] = useState(() => buildEmptyRecord(resource))
  const [editingId, setEditingId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [quickForm, setQuickForm] = useState(() => buildEmptyRecord(resource))
  const [quickSaving, setQuickSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importSummary, setImportSummary] = useState(null)

  useEffect(() => {
    setForm(buildEmptyRecord(resource))
    setQuickForm(buildEmptyRecord(resource))
    setEditingId(null)
    setSaving(false)
    setQuickSaving(false)
    setIsModalOpen(false)
    setIsImportModalOpen(false)
    setImporting(false)
    setImportSummary(null)
  }, [resource])

  const columns = useMemo(() => getColumns(resource), [resource])
  const canImport = IMPORTABLE_RESOURCE_KEYS.has(resource.key)

  function updateField(fieldName, value) {
    setForm((current) => ({ ...current, [fieldName]: value }))
  }

  function updateQuickField(fieldName, value) {
    setQuickForm((current) => ({ ...current, [fieldName]: value }))
  }

  function openCreateModal() {
    setForm(buildEmptyRecord(resource))
    setEditingId(null)
    setIsModalOpen(true)
  }

  function openEditModal(item) {
    const nextForm = buildEmptyRecord(resource)
    resource.fields.forEach((field) => {
      nextForm[field.name] = field.type === 'money' ? centsToMoneyInput(item[field.name]) : item[field.name] ?? ''
    })
    setForm(nextForm)
    setEditingId(item.id)
    setIsModalOpen(true)
  }

  function closeModal(nextResource = resource) {
    setForm(buildEmptyRecord(nextResource))
    setEditingId(null)
    setSaving(false)
    setIsModalOpen(false)
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave(resource, normalizePayload(resource, form), editingId)
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  async function deleteItem(item) {
    setDeletingId(item.id)
    try {
      await onDelete(resource, item.id)
    } finally {
      setDeletingId(null)
    }
  }

  async function submitQuickCreate(event) {
    event.preventDefault()
    setQuickSaving(true)
    try {
      await onSave(resource, normalizePayload(resource, quickForm), null)
      setQuickForm(buildEmptyRecord(resource))
    } finally {
      setQuickSaving(false)
    }
  }

  async function importFile(file) {
    setImporting(true)
    setImportSummary(null)

    try {
      const rows = await readImportFile(file)
      validateImportHeaders(rows, resource)
      const existingValues = new Set(
        data.map((item) => normalizeHeader(item[getUniqueFieldName(resource)])).filter(Boolean),
      )
      const inserted = []
      const refused = []

      for (const [index, row] of rows.entries()) {
        const result = validateImportRow(row, index + 2, resource, lookups, existingValues)
        if (result.reasons.length > 0) {
          refused.push({
            reasons: result.reasons,
            rowNumber: result.rowNumber,
          })
          continue
        }

        try {
          await onSave(resource, normalizePayload(resource, result.form), null)
          existingValues.add(result.uniqueValue)
          inserted.push({
            rowNumber: result.rowNumber,
            value: result.form[getUniqueFieldName(resource)],
          })
        } catch (importError) {
          refused.push({
            reasons: [importError.message],
            rowNumber: result.rowNumber,
          })
        }
      }

      setImportSummary({
        inserted,
        refused,
        total: rows.length,
      })
    } catch (importError) {
      setImportSummary({
        inserted: [],
        refused: [{ reasons: [importError.message], rowNumber: '-' }],
        total: 0,
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <h1>{resource.label}</h1>
        </div>
        <div className="page-actions">
          <button className="secondary-button" disabled={loading} onClick={onReload}>
            {loading ? <Loader label="Chargement" small /> : <FontAwesomeIcon icon={faRotate} />}
          </button>
          {canImport ? (
            <button className="secondary-button" disabled={loading} onClick={() => setIsImportModalOpen(true)}>
              <FontAwesomeIcon icon={faFileImport} />
            </button>
          ) : null}
          <button className="primary-button page-add-button" disabled={loading} onClick={openCreateModal}>
            <FontAwesomeIcon icon={faSquarePlus} />
          </button>
        </div>
      </header>

      {error ? <p className="alert">{error}</p> : null}

      <section className="table-panel list-panel">
        <div className="table-title">
          <h2>Liste</h2>
          <span>{loading ? 'Chargement...' : `${data.length} ligne(s)`}</span>
        </div>

        <div className="table-wrap">
          {loading ? <LoadingOverlay label="Chargement des données" /> : null}
          <form id={`quick-create-${resource.key}`} onSubmit={submitQuickCreate} />
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{getColumnLabel(resource, column)}</th>
                ))}
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  {columns.map((column) => (
                    <td key={column}>{renderCell(column, item, resource, lookups)}</td>
                  ))}
                  <td className="actions">
                    <button disabled={loading || deletingId === item.id} onClick={() => openEditModal(item)}>
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                      className="danger-button"
                      disabled={loading || deletingId === item.id}
                      onClick={() => deleteItem(item)}
                    >
                      {deletingId === item.id ? <Loader label="Suppression" small /> : <FontAwesomeIcon icon={faTrashCan} />}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={columns.length + 1}>
                    Aucune donnée.
                  </td>
                </tr>
              ) : null}
              <QuickCreateRow
                columns={columns}
                formId={`quick-create-${resource.key}`}
                lookups={lookups}
                quickForm={quickForm}
                quickSaving={quickSaving}
                resource={resource}
                onChange={updateQuickField}
              />
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <ResourceModal
          editingId={editingId}
          form={form}
          lookups={lookups}
          resource={resource}
          saving={saving}
          onChange={updateField}
          onClose={() => closeModal()}
          onSubmit={submit}
        />
      ) : null}

      {isImportModalOpen ? (
        <ImportModal
          importing={importing}
          resource={resource}
          summary={importSummary}
          onClose={() => setIsImportModalOpen(false)}
          onImport={importFile}
        />
      ) : null}
    </main>
  )
}

function QuickCreateRow({ resource, columns, quickForm, lookups, quickSaving, formId, onChange }) {
  return (
    <tr className="quick-create-row">
      {columns.map((column) => (
        <td key={column}>{renderQuickCell(column, resource, quickForm, lookups, formId, quickSaving, onChange)}</td>
      ))}
      <td className="actions">
        <button className="quick-add-button" disabled={quickSaving} form={formId} type="submit">
          {quickSaving ? <Loader label="Ajout" small /> : <FontAwesomeIcon icon={faSquarePlus} />}
        </button>
      </td>
    </tr>
  )
}

function renderQuickCell(column, resource, quickForm, lookups, formId, quickSaving, onChange) {
  if (column === 'id') {
    return <span className="quick-create-placeholder">new</span>
  }

  if (column === 'icon_preview') {
    return renderCell(column, quickForm, resource, lookups)
  }

  const field = resource.fields.find((resourceField) => resourceField.name === column)
  if (!field) {
    return null
  }

  return (
    <FieldInput
      compact
      disabled={quickSaving}
      field={field}
      formId={formId}
      lookups={lookups}
      value={quickForm[field.name]}
      onChange={onChange}
    />
  )
}

function ResourceModal({ resource, form, lookups, editingId, saving, onChange, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" aria-modal="true" role="dialog">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Formulaire</p>
            <h2>{editingId ? `Modifier #${editingId}` : `Ajouter ${resource.singular}`}</h2>
          </div>
          <button className="ghost-button" disabled={saving} type="button" onClick={onClose}>
            Fermer
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-grid modal-form-grid">
            {resource.fields.map((field) => (
              <label key={field.name}>
                <span>{field.label}</span>
                <FieldInput
                  disabled={saving}
                  field={field}
                  value={form[field.name]}
                  lookups={lookups}
                  onChange={onChange}
                />
              </label>
            ))}
          </div>

          <div className="modal-actions">
            <button className="secondary-button" disabled={saving} type="button" onClick={onClose}>
              Annuler
            </button>
            <button className="primary-button modal-submit-button" disabled={saving} type="submit">
              {saving ? <Loader label="Enregistrement" /> : editingId ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function validateImportHeaders(rows, resource) {
  if (!rows.length) {
    return
  }

  const actualHeaders = Object.keys(rows[0]).map(normalizeHeader)
  const expectedHeaders = resource.fields.map((field) => normalizeHeader(field.name))

  const missingHeaders = expectedHeaders.filter((header) => !actualHeaders.includes(header))

  if (missingHeaders.length > 0) {
    throw new Error(
      `Colonnes manquantes : ${missingHeaders.join(', ')}`
    )
  }
}

function ImportModal({ resource, importing, summary, onClose, onImport }) {
  const [file, setFile] = useState(null)

  function submit(event) {
    event.preventDefault()
    if (file) {
      onImport(file)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel import-modal-panel" aria-modal="true" role="dialog">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Import</p>
            <h2><FontAwesomeIcon icon={faFileImport} /> {resource.label}</h2>
          </div>
          <button className="ghost-button" disabled={importing} type="button" onClick={onClose}>
            Fermer
          </button>
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
            <button className="secondary-button" disabled={importing} type="button" onClick={onClose}>
              Annuler
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

function renderCell(column, item, resource, lookups) {
  if (column === 'icon_preview') {
    return (
      <span
        className="category-icon-preview"
        style={{ color: item.color }}
        dangerouslySetInnerHTML={{ __html: item.icon_html }}
      />
    )
  }

  const field = resource.fields.find((resourceField) => resourceField.name === column)
  return field ? formatValue(field, item, lookups) : item[column]
}

function FieldInput({ field, value, lookups, onChange, compact = false, formId, disabled = false }) {
  const className = compact ? 'compact-input' : undefined

  if (field.type === 'boolean') {
    return (
      <input
        className={className}
        checked={Boolean(value)}
        disabled={disabled}
        form={formId}
        type="checkbox"
        onChange={(event) => onChange(field.name, event.target.checked)}
      />
    )
  }

  if (field.type === 'select' || field.type === 'static-select') {
    const options =
      field.type === 'select'
        ? (lookups[field.source] ?? []).map((item) => ({ label: itemLabel(item), value: item.id }))
        : field.options ?? []

    return (
      <select
        className={className}
        disabled={disabled}
        form={formId}
        value={value}
        required={field.required}
        onChange={(event) => onChange(field.name, event.target.value)}
      >
        <option value="">{field.optional ? 'Aucun' : 'Choisir'}</option>
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      className={className}
      disabled={disabled}
      form={formId}
      type={field.type === 'money' ? 'text' : field.type}
      value={value}
      required={field.required}
      maxLength={field.name === 'currency' ? 3 : undefined}
      min={field.type === 'number' ? 0 : undefined}
      inputMode={field.type === 'money' ? 'decimal' : undefined}
      pattern={field.type === 'money' ? '[0-9]+([,.][0-9]{1,2})?' : undefined}
      placeholder={field.type === 'money' ? '0.00' : undefined}
      onChange={(event) => onChange(field.name, event.target.value)}
    />
  )
}

function LoadingOverlay({ label }) {
  return (
    <div className="loading-overlay">
      <Loader label={label} />
    </div>
  )
}

function Loader({ label, small = false }) {
  return (
    <span className={`loader-label ${small ? 'small' : ''}`}>
      <span className="loader-spinner" aria-hidden="true" />
      {label}
    </span>
  )
}

export default CrudPage
