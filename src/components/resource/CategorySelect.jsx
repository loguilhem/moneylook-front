import CategoryLabel from './CategoryLabel'
import SearchableSelect from './SearchableSelect'

function CategorySelect({
  categories = [],
  compact = false,
  disabled = false,
  fallback = 'Aucun',
  optional = false,
  placeholder = 'Choisir',
  value,
  onChange,
}) {
  const options = categories.map((category) => ({
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
