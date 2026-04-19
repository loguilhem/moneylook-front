import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '../context/AppContext'
import { getTranslatedResourceByKey } from '../resources'
import {
  IMPORTABLE_RESOURCE_KEYS,
  buildEmptyRecord,
  centsToMoneyInput,
  getColumns,
  getUniqueFieldName,
  normalizeHeader,
  normalizePayload,
  readImportFile,
  validateImportHeaders,
  validateImportRow,
} from '../components/resource/resourceUtils'

function buildRecordWithDefaults(resource, defaultBankAccountId) {
  const record = buildEmptyRecord(resource)
  const hasBankAccountField = resource.fields.some((field) => field.name === 'bank_account_id')
  if (hasBankAccountField && defaultBankAccountId) {
    record.bank_account_id = String(defaultBankAccountId)
  }

  return record
}

export function useResourceCrud(resourceKey) {
  const { store, loading, error, loadAll, saveResource, deleteResource } = useAppContext()
  const { t } = useTranslation()

  const translatedResourceByKey = useMemo(() => getTranslatedResourceByKey(t), [t])
  const resource = translatedResourceByKey[resourceKey]
  const safeResource = resource ?? { fields: [], key: resourceKey }
  const defaultBankAccountId = store.bankAccounts?.find((account) => account.is_default)?.id
  const [form, setForm] = useState(() => buildRecordWithDefaults(safeResource, defaultBankAccountId))
  const [editingId, setEditingId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [quickForm, setQuickForm] = useState(() => buildRecordWithDefaults(safeResource, defaultBankAccountId))
  const [quickSaving, setQuickSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importSummary, setImportSummary] = useState(null)

  const data = store[safeResource.key] ?? []
  const columns = useMemo(() => getColumns(safeResource), [safeResource])
  const canImport = IMPORTABLE_RESOURCE_KEYS.has(safeResource.key)
  const quickCreateFormId = `quick-create-${safeResource.key}`

  useEffect(() => {
    setForm(buildRecordWithDefaults(safeResource, defaultBankAccountId))
    setQuickForm(buildRecordWithDefaults(safeResource, defaultBankAccountId))
    setEditingId(null)
    setSaving(false)
    setQuickSaving(false)
    setIsFormOpen(false)
    setIsImportOpen(false)
    setImporting(false)
    setImportSummary(null)
  }, [defaultBankAccountId, safeResource])

  if (!resource) {
    throw new Error(`Unknown resource: ${resourceKey}`)
  }

  function updateField(fieldName, value) {
    setForm((current) => ({ ...current, [fieldName]: value }))
  }

  function updateQuickField(fieldName, value) {
    setQuickForm((current) => ({ ...current, [fieldName]: value }))
  }

  function openCreateForm() {
    setForm(buildRecordWithDefaults(resource, defaultBankAccountId))
    setEditingId(null)
    setIsFormOpen(true)
  }

  function openEditForm(item) {
    const nextForm = buildEmptyRecord(resource)
    resource.fields.forEach((field) => {
      nextForm[field.name] = field.type === 'money' ? centsToMoneyInput(item[field.name]) : item[field.name] ?? ''
    })
    setForm(nextForm)
    setEditingId(item.id)
    setIsFormOpen(true)
  }

  function closeForm() {
    setForm(buildRecordWithDefaults(resource, defaultBankAccountId))
    setEditingId(null)
    setSaving(false)
    setIsFormOpen(false)
  }

  function getMissingRequiredField(targetForm) {
    return resource.fields.find(
      (field) =>
        field.required &&
        (targetForm[field.name] === null || targetForm[field.name] === undefined || targetForm[field.name] === ''),
    )
  }

  async function submitForm(event) {
    event.preventDefault()
    const missingField = getMissingRequiredField(form)
    if (missingField) {
      window.alert(`${missingField.label} est obligatoire.`)
      return
    }

    setSaving(true)
    try {
      await saveResource(resource, normalizePayload(resource, form), editingId)
      closeForm()
    } finally {
      setSaving(false)
    }
  }

  async function deleteItem(item) {
    setDeletingId(item.id)
    try {
      await deleteResource(resource, item.id)
    } finally {
      setDeletingId(null)
    }
  }

  async function createItem(payload) {
    await saveResource(resource, payload, null)
  }

  async function submitQuickCreate(event) {
    event.preventDefault()
    const missingField = getMissingRequiredField(quickForm)
    if (missingField) {
      window.alert(`${missingField.label} est obligatoire.`)
      return
    }

    setQuickSaving(true)
    try {
      await saveResource(resource, normalizePayload(resource, quickForm), null)
      setQuickForm(buildRecordWithDefaults(resource, defaultBankAccountId))
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
        const result = validateImportRow(row, index + 2, resource, store, existingValues)
        if (result.reasons.length > 0) {
          refused.push({
            reasons: result.reasons,
            rowNumber: result.rowNumber,
          })
          continue
        }

        try {
          await saveResource(resource, normalizePayload(resource, result.form), null)
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

  return {
    canImport,
    columns,
    data,
    deletingId,
    editingId,
    error,
    form,
    importSummary,
    importing,
    isFormOpen,
    isImportOpen,
    loading,
    lookups: store,
    quickCreateFormId,
    quickForm,
    quickSaving,
    resource,
    saving,
    closeForm,
    closeImport: () => setIsImportOpen(false),
    createItem,
    deleteItem,
    importFile,
    openCreateForm,
    openEditForm,
    openImport: () => setIsImportOpen(true),
    onReload: loadAll,
    submitForm,
    submitQuickCreate,
    updateField,
    updateQuickField,
  }
}
