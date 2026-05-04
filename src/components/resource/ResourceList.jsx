import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faArrowLeft, faCheck, faPenToSquare, faSort, faSortDown, faSortUp, faSquarePlus, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons'
import FieldInput from './FieldInput'
import { Loader, LoadingOverlay } from './Loader'
import { formatResourceValue, getColumnLabel, itemLabel, normalizeHeader } from './resourceUtils'
import CategoryLabel from './CategoryLabel'
import MultiSearchableSelect from './MultiSearchableSelect'

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

  if (resource.key === 'categories' && column === 'parent') {
    const parent = lookups.categories?.find((entry) => entry.id === item.parent)
    return <CategoryLabel category={parent} fallback={item.parent ? `#${item.parent}` : '-'} />
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
    parent: lookups.categories,
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

function buildFilterOptions(column, lookups) {
  if (column === 'category_id') {
    return (lookups.categories ?? []).map((category) => ({
      item: category,
      label: category.name,
      searchLabel: category.name,
      value: category.id,
    }))
  }

  if (column === 'bank_account_id') {
    return (lookups.bankAccounts ?? []).map((account) => ({
      label: itemLabel(account),
      searchLabel: itemLabel(account),
      value: account.id,
    }))
  }

  return []
}

function renderFilterInput(column, filters, resource, lookups, onChange) {
  if (column === 'category_id') {
    return (
      <MultiSearchableSelect
        options={buildFilterOptions(column, lookups)}
        placeholder={getColumnLabel(resource, column)}
        values={filters[column] ?? []}
        renderOption={(option) => <CategoryLabel category={option.item} />}
        renderValue={(selectedOptions) =>
          selectedOptions.length === 0 ? (
            <span className="searchable-select-placeholder">{getColumnLabel(resource, column)}</span>
          ) : selectedOptions.length <= 2 ? (
            <span className="multi-select-value-list">
              {selectedOptions.map((option) => (
                <CategoryLabel key={option.value} category={option.item} />
              ))}
            </span>
          ) : (
            `${selectedOptions.length} ${getColumnLabel(resource, column)}`
          )
        }
        onChange={(value) => onChange(column, value)}
      />
    )
  }

  if (column === 'bank_account_id') {
    return (
      <MultiSearchableSelect
        options={buildFilterOptions(column, lookups)}
        placeholder={getColumnLabel(resource, column)}
        values={filters[column] ?? []}
        onChange={(value) => onChange(column, value)}
      />
    )
  }

  return (
    <input
      className="compact-input column-filter-input"
      type="search"
      value={filters[column] ?? ''}
      placeholder={getColumnLabel(resource, column)}
      onChange={(event) => onChange(column, event.target.value)}
    />
  )
}

function ColumnFilterRow({ columns, filters, lookups, resource, onChange }) {
  return (
    <tr className="column-filter-row">
      {columns.map((column) => (
        <td key={column}>{renderFilterInput(column, filters, resource, lookups, onChange)}</td>
      ))}
      <td />
    </tr>
  )
}

function TransactionMobileControls({ categoryFilter, lookups, resource, sort, onCategoryChange, onDateSort }) {
  const isDateSortActive = sort.column === 'date'

  return (
    <div className="transaction-mobile-controls">
      <button className={`secondary-button ${isDateSortActive ? 'is-active' : ''}`} type="button" onClick={onDateSort}>
        <FontAwesomeIcon icon={isDateSortActive ? getSortIconForDirection(sort.direction) : faSort} />
        <span>Date</span>
      </button>
      <TransactionMobileCategoryFilter
        options={buildFilterOptions('category_id', lookups)}
        placeholder={getColumnLabel(resource, 'category_id')}
        values={categoryFilter ?? []}
        onChange={onCategoryChange}
      />
    </div>
  )
}

function TransactionMobileCategoryFilter({ options, placeholder, values, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const normalizedValues = values.map((value) => String(value))
  const selectedOptions = options.filter((option) => normalizedValues.includes(String(option.value)))

  function toggleValue(nextValue) {
    const normalizedValue = String(nextValue)
    const nextValues = normalizedValues.includes(normalizedValue)
      ? normalizedValues.filter((value) => value !== normalizedValue)
      : [...normalizedValues, normalizedValue]

    onChange(nextValues)
    setIsOpen(false)
  }

  function closeWhenLeaving(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false)
    }
  }

  return (
    <div className="transaction-category-filter" onBlur={closeWhenLeaving}>
      <button className="transaction-category-filter-trigger" type="button" onClick={() => setIsOpen((current) => !current)}>
        {selectedOptions.length === 0 ? (
          <span className="searchable-select-placeholder">{placeholder}</span>
        ) : (
          <span className="transaction-category-filter-value">
            {selectedOptions.map((option) => (
              <CategoryLabel key={option.value} category={option.item} iconOnly />
            ))}
          </span>
        )}
      </button>

      {isOpen ? (
        <div className="transaction-category-filter-menu">
          {options.map((option) => {
            const isSelected = normalizedValues.includes(String(option.value))

            return (
              <button
                className={`transaction-category-filter-option ${isSelected ? 'is-selected' : ''}`}
                key={option.value}
                type="button"
                aria-label={option.label}
                aria-pressed={isSelected}
                onClick={() => toggleValue(option.value)}
              >
                <CategoryLabel category={option.item} iconOnly />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function getSortIconForDirection(direction) {
  return direction === 'asc' ? faSortUp : faSortDown
}

function TransactionMobileList({ data, loading, lookups, resource, onEdit }) {
  return (
    <div className="transaction-mobile-list">
      {data.map((item) => (
        <button className="transaction-mobile-row" key={item.id} type="button" disabled={loading} onClick={() => onEdit(item)}>
          <span className="transaction-mobile-main">
            <span className="transaction-mobile-date">{renderCell('date', item, resource, lookups)}</span>
            <span className="transaction-mobile-detail">
              <span className="transaction-mobile-category">
                <CategoryLabel
                  category={lookups.categories?.find((entry) => entry.id === item.category_id)}
                  fallback=""
                  iconOnly
                />
              </span>
              <span className="transaction-mobile-label">{renderCell('label', item, resource, lookups)}</span>
            </span>
          </span>
          <span className="transaction-mobile-amount">{renderCell('amount_cents', item, resource, lookups)}</span>
        </button>
      ))}
      {!loading && data.length === 0 ? <div className="transaction-mobile-empty">Aucune donnée.</div> : null}
    </div>
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
      .map(([column, value]) =>
        Array.isArray(value)
          ? [column, value.map((entry) => String(entry)).filter(Boolean)]
          : [column, normalizeHeader(value)],
      )
      .filter(([, value]) => (Array.isArray(value) ? value.length > 0 : value))
    const filteredData = activeFilters.length
      ? data.filter((item) =>
          activeFilters.every(([column, value]) => {
            if (Array.isArray(value)) {
              return value.includes(String(item[column] ?? ''))
            }

            return normalizeHeader(getCellSearchValue(column, item, resource, lookups)).includes(value)
          }),
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
  const isTransactionResource = resource.key === 'expenses' || resource.key === 'incomes'

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

    return getSortIconForDirection(sort.direction)
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
    <section className={`table-panel list-panel ${isTransactionResource ? 'is-transaction-list' : ''}`}>
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

      {isTransactionResource ? (
        <TransactionMobileControls
          categoryFilter={filters.category_id}
          lookups={lookups}
          resource={resource}
          sort={sort}
          onCategoryChange={(value) => updateFilter('category_id', value)}
          onDateSort={() => toggleSort('date')}
        />
      ) : null}

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
            <ColumnFilterRow columns={columns} filters={filters} lookups={lookups} resource={resource} onChange={updateFilter} />
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
        {isTransactionResource ? (
          <TransactionMobileList
            data={displayedData}
            loading={loading}
            lookups={lookups}
            resource={resource}
            onEdit={onEdit}
          />
        ) : null}
      </div>
    </section>
  )
}

export default ResourceList
