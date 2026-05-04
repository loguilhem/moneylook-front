import CategoryLabel from './CategoryLabel'
import SearchableSelect from './SearchableSelect'

function CategorySelect({
  categories = [],
  compact = false,
  disabled = false,
  excludeIds = [],
  fallback = 'Aucun',
  optional = false,
  placeholder = 'Choisir',
  value,
  onChange,
}) {
  const excludedIds = new Set(excludeIds.map((id) => String(id)))
  const options = categories
    .filter((category) => !excludedIds.has(String(category.id)))
    .map((category) => ({
      item: category,
      label: category.name,
      searchLabel: category.name,
      value: category.id,
    }))

  return (
    <SearchableSelect
      compact={compact}
      disabled={disabled}
      fallback={fallback}
      optional={optional}
      options={options}
      placeholder={placeholder}
      value={value}
      renderOption={(option) => <CategoryLabel category={option.item} />}
      renderValue={(option) => <CategoryLabel category={option.item} />}
      onChange={onChange}
    />
  )
}

export default CategorySelect
