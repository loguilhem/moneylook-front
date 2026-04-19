import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faArrowLeft, faCheck, faPenToSquare, faSort, faSortDown, faSortUp, faSquarePlus, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons'
import FieldInput from './FieldInput'
import { Loader, LoadingOverlay } from './Loader'
import { formatResourceValue, getColumnLabel, itemLabel, normalizeHeader } from './resourceUtils'
import CategoryLabel from './CategoryLabel'

const PAGE_SIZE_OPTIONS = [500, 100, 50]

function BooleanIcon({ value }) {
  return (
    <span className={`boolean-icon ${value ? 'is-true' : 'is-false'}`}>
      <FontAwesomeIcon icon={value ? faCheck : faXmark} />
    </span>
  )
}

function renderCell(column, item, resource, lookups) {
  if (resource.key === 'categories' && column === 'name') {
    return <CategoryLabel category={item} />
  }

  const field = resource.fields.find((resourceField) => resourceField.name === column)
  if (field?.name === 'category_id') {
    const category = lookups.categories?.find((entry) => entry.id === item.category_id)
    return <CategoryLabel category={category} fallback={item.category_id ? `#${item.category_id}` : '-'} />
  }

  if (field?.type === 'boolean') {
    return <BooleanIcon value={Boolean(item[column])} />
  }

  return field ? formatResourceValue(field, item, lookups) : item[column]
}

function getLookupValue(field, value, lookups) {
  if (field.type === 'static-select') {
    return field.options?.find((option) => option.value === value)?.label ?? value
  }

  const lookupMap = {
    account_type_id: lookups.accountTypes,
    bank_account_id: lookups.bankAccounts,
    category_id: lookups.categories,
  }
  const lookup = lookupMap[field.name]
  const lookupItem = lookup?.find((entry) => entry.id === value)

  return lookupItem ? itemLabel(lookupItem) : value
}

function getCellSearchValue(column, item, resource, lookups) {
  const field = resource.fields.find((resourceField) => resourceField.name === column)
  const value = item[column]

  if (!field) {
    return String(value ?? '')
  }

  if (field.type === 'boolean') {
    return value ? 'oui yes true actif active check' : 'non no false inactif inactive croix'
  }

  if (field.type === 'select' || field.type === 'static-select') {
    return String(getLookupValue(field, value, lookups) ?? '')
  }

  return String(formatResourceValue(field, item, lookups) ?? value ?? '')
}

function getCellSortValue(column, item, resource, lookups) {
  const field = resource.fields.find((resourceField) => resourceField.name === column)
  const value = item[column]

  if (!field) {
    return value
  }

  if (field.type === 'money' || field.type === 'number') {
    return Number(value ?? 0)
  }

  if (field.type === 'boolean') {
    return value ? 1 : 0
  }

  if (field.type === 'select' || field.type === 'static-select') {
    return String(getLookupValue(field, value, lookups) ?? '').toLowerCase()
  }

  return String(value ?? '').toLowerCase()
}

function renderQuickCell(column, resource, quickForm, lookups, formId, quickSaving, onChange) {
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

function ColumnFilterRow({ columns, filters, resource, onChange }) {
  return (
    <tr className="column-filter-row">
      {columns.map((column) => (
        <td key={column}>
          <input
            className="compact-input column-filter-input"
            type="search"
            value={filters[column] ?? ''}
            placeholder={getColumnLabel(resource, column)}
            onChange={(event) => onChange(column, event.target.value)}
          />
        </td>
      ))}
      <td />
    </tr>
  )
}

function ResourceList({
  columns,
  data,
  deletingId,
  formId,
  loading,
  lookups,
  quickForm,
  quickSaving,
  resource,
  onDelete,
  onEdit,
  onQuickChange,
  onQuickSubmit,
}) {
  const [filters, setFilters] = useState({})
  const [sort, setSort] = useState({ column: null, direction: 'asc' })
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [page, setPage] = useState(1)
  const displayedData = useMemo(() => {
    const activeFilters = Object.entries(filters)
      .map(([column, value]) => [column, normalizeHeader(value)])
      .filter(([, value]) => value)
    const filteredData = activeFilters.length
      ? data.filter((item) =>
          activeFilters.every(([column, value]) =>
            normalizeHeader(getCellSearchValue(column, item, resource, lookups)).includes(value),
          ),
        )
      : data

    if (!sort.column) {
      return filteredData
    }

    return [...filteredData].sort((leftItem, rightItem) => {
      const leftValue = getCellSortValue(sort.column, leftItem, resource, lookups)
      const rightValue = getCellSortValue(sort.column, rightItem, resource, lookups)
      const direction = sort.direction === 'asc' ? 1 : -1

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return (leftValue - rightValue) * direction
      }

      return String(leftValue).localeCompare(String(rightValue), 'fr', { numeric: true }) * direction
    })
  }, [data, filters, lookups, resource, sort])
  const pageCount = Math.max(1, Math.ceil(displayedData.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedData = displayedData.slice(pageStart, pageStart + pageSize)
  const firstVisibleRow = displayedData.length === 0 ? 0 : pageStart + 1
  const lastVisibleRow = Math.min(pageStart + pageSize, displayedData.length)

  function toggleSort(column) {
    setPage(1)
    setSort((current) => {
      if (current.column !== column) {
        return { column, direction: 'asc' }
      }

      if (current.direction === 'asc') {
        return { column, direction: 'desc' }
      }

      return { column: null, direction: 'asc' }
    })
  }

  function getSortIcon(column) {
    if (sort.column !== column) {
      return faSort
    }

    return sort.direction === 'asc' ? faSortUp : faSortDown
  }

  function updateFilter(column, value) {
    setFilters((current) => ({ ...current, [column]: value }))
    setPage(1)
  }

  function updatePageSize(value) {
    setPageSize(Number(value))
    setPage(1)
  }

  return (
    <section className="table-panel list-panel">
      <div className="table-title">
        <div className="list-toolbar">
          <span>
            {loading
              ? 'Chargement...'
              : `${firstVisibleRow}-${lastVisibleRow} sur ${displayedData.length} ligne(s)`}
          </span>
          <label className="page-size-label">
            <span>Lignes</span>
            <select value={pageSize} onChange={(event) => updatePageSize(event.target.value)}>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <div className="pagination-controls">
            <button
              className="secondary-button"
              disabled={currentPage <= 1}
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <span>
              {currentPage}/{pageCount}
            </span>
            <button
              className="secondary-button"
              disabled={currentPage >= pageCount}
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? <LoadingOverlay label="Chargement des données" /> : null}
        <form id={formId} onSubmit={onQuickSubmit} />
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>
                  <button className="column-sort-button" type="button" onClick={() => toggleSort(column)}>
                    <span>{getColumnLabel(resource, column)}</span>
                    <FontAwesomeIcon icon={getSortIcon(column)} />
                  </button>
                </th>
              ))}
              <th>actions</th>
            </tr>
            <ColumnFilterRow columns={columns} filters={filters} resource={resource} onChange={updateFilter} />
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id}>
                {columns.map((column) => (
                  <td key={column}>{renderCell(column, item, resource, lookups)}</td>
                ))}
                <td className="actions">
                  <button
                    disabled={loading || deletingId === item.id || item.is_system}
                    title={item.is_system ? 'Type système non modifiable' : undefined}
                    onClick={() => onEdit(item)}
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    className="danger-button"
                    disabled={loading || deletingId === item.id || item.is_system}
                    title={item.is_system ? 'Type système non supprimable' : undefined}
                    onClick={() => onDelete(item)}
                  >
                    {deletingId === item.id ? <Loader label="Suppression" small /> : <FontAwesomeIcon icon={faTrashCan} />}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && displayedData.length === 0 ? (
              <tr>
                <td className="empty-cell" colSpan={columns.length + 1}>
                  Aucune donnée.
                </td>
              </tr>
            ) : null}
          </tbody>
          <tfoot>
            <QuickCreateRow
              columns={columns}
              formId={formId}
              lookups={lookups}
              quickForm={quickForm}
              quickSaving={quickSaving}
              resource={resource}
              onChange={onQuickChange}
            />
          </tfoot>
        </table>
      </div>
    </section>
  )
}

export default ResourceList
