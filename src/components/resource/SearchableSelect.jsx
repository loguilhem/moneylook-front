import { useMemo, useRef, useState } from 'react'
import { normalizeHeader } from './resourceUtils'

function SearchableSelect({
  compact = false,
  disabled = false,
  fallback = 'Aucun',
  optional = false,
  options = [],
  placeholder = 'Choisir',
  searchPlaceholder = 'Rechercher',
  value,
  onChange,
  renderOption,
  renderValue,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchInputRef = useRef(null)
  const selectedOption = options.find((option) => String(option.value) === String(value))
  const hasValue = value !== null && value !== undefined && value !== ''
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

  function selectValue(nextValue) {
    onChange(nextValue)
    setSearch('')
    setIsOpen(false)
  }

  function closeWhenLeaving(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false)
      setSearch('')
    }
  }

  return (
    <div className={`searchable-select ${compact ? 'is-compact' : ''}`} onBlur={closeWhenLeaving}>
      <button className="searchable-select-trigger" disabled={disabled} type="button" onClick={openSelect}>
        {selectedOption ? (
          renderValue ? renderValue(selectedOption) : selectedOption.label
        ) : (
          <span className="searchable-select-placeholder">{hasValue ? fallback : placeholder}</span>
        )}
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
          {optional ? (
            <button className="searchable-select-option" type="button" onMouseDown={() => selectValue('')}>
              <span className="searchable-select-placeholder">{fallback}</span>
            </button>
          ) : null}
          {filteredOptions.map((option) => (
            <button
              className={`searchable-select-option ${String(option.value) === String(value) ? 'is-selected' : ''}`}
              key={option.value}
              type="button"
              onMouseDown={() => selectValue(String(option.value))}
            >
              {renderOption ? renderOption(option) : option.label}
            </button>
          ))}
          {filteredOptions.length === 0 ? <span className="searchable-select-empty">Aucun résultat</span> : null}
        </div>
      ) : null}
    </div>
  )
}

export default SearchableSelect
