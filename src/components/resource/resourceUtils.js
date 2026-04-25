import ExcelJS from 'exceljs/dist/exceljs.min.js'

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
    const excelEpoch = Date.UTC(1899, 11, 30)
    const parsedDate = new Date(excelEpoch + Math.round(value * 86400000))
    if (Number.isNaN(parsedDate.getTime())) {
      return null
    }
    return parsedDate.toISOString().slice(0, 10)
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

function normalizeWorksheetCellValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  if (value instanceof Date || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(normalizeWorksheetCellValue).join(', ')
  }

  if (typeof value === 'object') {
    if ('result' in value) {
      return normalizeWorksheetCellValue(value.result)
    }

    if ('text' in value && typeof value.text === 'string') {
      return value.text
    }

    if ('hyperlink' in value && typeof value.hyperlink === 'string') {
      return value.hyperlink
    }

    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text ?? '').join('')
    }

    if ('error' in value) {
      return ''
    }
  }

  return String(value)
}

function worksheetToRows(worksheet) {
  if (!worksheet || worksheet.rowCount === 0) {
    return []
  }

  const headerRow = worksheet.getRow(1)
  const columnCount = Math.max(headerRow.cellCount, headerRow.actualCellCount)
  const headers = Array.from({ length: columnCount }, (_, index) =>
    String(normalizeWorksheetCellValue(headerRow.getCell(index + 1).value)).trim(),
  )

  const rows = []

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return
    }

    const record = headers.reduce((accumulator, header, index) => {
      if (!header) {
        return accumulator
      }

      accumulator[header] = normalizeWorksheetCellValue(row.getCell(index + 1).value)
      return accumulator
    }, {})

    if (Object.values(record).some((value) => !isBlank(value))) {
      rows.push(record)
    }
  })

  return rows
}

function detectCsvDelimiter(line) {
  const candidates = [',', ';', '\t']
  return candidates.reduce(
    (best, delimiter) => {
      const count = line.split(delimiter).length
      return count > best.count ? { count, delimiter } : best
    },
    { count: 0, delimiter: ',' },
  ).delimiter
}

function parseCsv(text) {
  const firstNonEmptyLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstNonEmptyLine) {
    return []
  }

  const delimiter = detectCsvDelimiter(firstNonEmptyLine)
  const rows = []
  let currentRow = []
  let currentCell = ''
  let insideQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const nextCharacter = text[index + 1]

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        currentCell += '"'
        index += 1
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (!insideQuotes && character === delimiter) {
      currentRow.push(currentCell)
      currentCell = ''
      continue
    }

    if (!insideQuotes && (character === '\n' || character === '\r')) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1
      }
      currentRow.push(currentCell)
      rows.push(currentRow)
      currentRow = []
      currentCell = ''
      continue
    }

    currentCell += character
  }

  currentRow.push(currentCell)
  rows.push(currentRow)

  const [headers = [], ...dataRows] = rows.filter((row) => row.some((cell) => String(cell).trim() !== ''))
  return dataRows
    .map((row) =>
      headers.reduce((record, header, index) => {
        const normalizedHeader = String(header ?? '').trim()
        if (normalizedHeader) {
          record[normalizedHeader] = row[index] ?? ''
        }
        return record
      }, {}),
    )
    .filter((row) => Object.values(row).some((value) => !isBlank(value)))
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
  const filename = file.name.toLowerCase()

  if (filename.endsWith('.csv')) {
    const text = await file.text()
    return parseCsv(text)
  }

  if (!filename.endsWith('.xlsx')) {
    throw new Error('Formats supportes : .xlsx, .csv')
  }

  const buffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  return worksheetToRows(workbook.worksheets[0])
}
