import { itemLabel } from './resourceUtils'
import CategorySelect from './CategorySelect'
import SearchableSelect from './SearchableSelect'

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
    if (field.name === 'category_id') {
      return (
        <CategorySelect
          categories={lookups.categories ?? []}
          compact={compact}
          disabled={disabled}
          fallback="Aucun"
          optional={field.optional}
          placeholder={field.optional ? 'Aucun' : 'Choisir'}
          value={value}
          onChange={(nextValue) => onChange(field.name, nextValue)}
        />
      )
    }

    const options =
      field.type === 'select'
        ? (lookups[field.source] ?? []).map((item) => ({ label: itemLabel(item), value: item.id }))
        : field.options ?? []

    return (
      <SearchableSelect
        compact={compact}
        disabled={disabled}
        fallback="Aucun"
        optional={field.optional}
        options={options}
        placeholder={field.optional ? 'Aucun' : 'Choisir'}
        value={value}
        onChange={(nextValue) => onChange(field.name, nextValue)}
      />
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

export default FieldInput
