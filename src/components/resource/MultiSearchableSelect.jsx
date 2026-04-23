import { useMemo, useRef, useState } from 'react'
import { normalizeHeader } from './resourceUtils'

function defaultRenderValue({ selectedOptions, placeholder }) {
  if (selectedOptions.length === 0) {
    return <span className="searchable-select-placeholder">{placeholder}</span>
  }

  if (selectedOptions.length <= 2) {
    return selectedOptions.map((option) => option.label).join(', ')
  }

  return `${selectedOptions.length} selection(s)`
}

function MultiSearchableSelect({
  disabled = false,
  options = [],
  placeholder = 'Choisir',
  searchPlaceholder = 'Rechercher',
  values = [],
  onChange,
  renderOption,
  renderValue,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchInputRef = useRef(null)
  const normalizedValues = useMemo(() => values.map((value) => String(value)), [values])
  const selectedOptions = useMemo(
    () => options.filter((option) => normalizedValues.includes(String(option.value))),
    [options, normalizedValues],
  )
  const filteredOptions = useMemo(() => {
    const normalizedSearch = normalizeHeader(search)
    if (!normalizedSearch) {
      return options
    }

    return options.filter((option) => normalizeHeader(option.searchLabel ?? option.label).includes(normalizedSearch))
  }, [options, search])

  function openSelect() {
    if (disabled) {
      return
    }

    setIsOpen((current) => {
      const nextIsOpen = !current
      if (nextIsOpen) {
        window.setTimeout(() => searchInputRef.current?.focus(), 0)
      }
      return nextIsOpen
    })
  }

  function toggleValue(nextValue) {
    const normalizedValue = String(nextValue)
    const nextValues = normalizedValues.includes(normalizedValue)
      ? normalizedValues.filter((value) => value !== normalizedValue)
      : [...normalizedValues, normalizedValue]

    onChange(nextValues)
  }

  function closeWhenLeaving(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false)
      setSearch('')
    }
  }

  return (
    <div className="searchable-select searchable-select-multi" onBlur={closeWhenLeaving}>
      <button className="searchable-select-trigger" disabled={disabled} type="button" onClick={openSelect}>
        {renderValue ? renderValue(selectedOptions) : defaultRenderValue({ selectedOptions, placeholder })}
      </button>

      {isOpen ? (
        <div className="searchable-select-menu">
          <input
            className="compact-input searchable-select-search"
            placeholder={searchPlaceholder}
            ref={searchInputRef}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {filteredOptions.map((option) => {
            const isSelected = normalizedValues.includes(String(option.value))

            return (
              <button
                className={`searchable-select-option ${isSelected ? 'is-selected' : ''}`}
                key={option.value}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault()
                  toggleValue(option.value)
                }}
              >
                <span className={`multi-select-check ${isSelected ? 'is-selected' : ''}`} aria-hidden="true" />
                {renderOption ? renderOption(option) : option.label}
              </button>
            )
          })}
          {filteredOptions.length === 0 ? <span className="searchable-select-empty">Aucun résultat</span> : null}
        </div>
      ) : null}
    </div>
  )
}

export default MultiSearchableSelect
