import * as XLSX from 'xlsx'

const DEFAULT_CURRENCY = 'CHF'

export const IMPORTABLE_RESOURCE_KEYS = new Set(['recurringIncomes', 'recurringExpenses', 'bankAccounts', 'categories'])

export function centsToMoneyInput(cents) {
  if (cents === null || cents === undefined || cents === '') {
    return ''
  }

  return (Number(cents) / 100).toFixed(2)
}

export function moneyInputToCents(value) {
  const normalizedValue = String(value ?? '').trim().replace(',', '.')
  const amount = Number(normalizedValue)

  return Number.isFinite(amount) ? Math.round(amount * 100) : NaN
}

export function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  const normalizedValue = normalizeHeader(value)
  return ['1', 'true', 'yes', 'oui', 'active', 'actif'].includes(normalizedValue)
}

export function buildEmptyRecord(resource) {
  return resource.fields.reduce((record, field) => {
    record[field.name] = field.defaultValue ?? ''
    return record
  }, {})
}

export function normalizePayload(resource, form) {
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

export function itemLabel(item) {
  return item?.label ?? item?.name ?? `#${item?.id}`
}

function getCurrency(item, lookups) {
  if (item?.currency) {
    return item.currency
  }

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

export function formatResourceValue(field, item, lookups) {
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

export function getColumnLabel(resource, column) {
  if (column === 'icon_preview') {
    return 'Aperçu'
  }

  return resource.fields.find((field) => field.name === column)?.label ?? column
}

export function getColumns(resource) {
  return resource.fields.map((field) => field.name)
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

function getRowValue(row, field) {
  const expectedKey = normalizeHeader(field.name)
  const rowKey = Object.keys(row).find((key) => normalizeHeader(key) === expectedKey)
  return rowKey ? row[rowKey] : ''
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

export function getUniqueFieldName(resource) {
  return resource.fields.some((field) => field.name === 'name') ? 'name' : 'label'
}

export function validateImportHeaders(rows, resource) {
  if (!rows.length) {
    return
  }

  const actualHeaders = Object.keys(rows[0]).map(normalizeHeader)
  const expectedHeaders = resource.fields.map((field) => normalizeHeader(field.name))
  const missingHeaders = expectedHeaders.filter((header) => !actualHeaders.includes(header))

  if (missingHeaders.length > 0) {
    throw new Error(`Colonnes manquantes : ${missingHeaders.join(', ')}`)
  }
}

export function validateImportRow(row, rowNumber, resource, lookups, existingValues) {
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

export async function readImportFile(file) {
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
