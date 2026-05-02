import { itemLabel } from './resourceUtils'

const ICON_TAG_PATTERN = /^<i\s+class=["']([^"']+)["']\s*><\/i>$/
const ICON_CLASS_PATTERN = /^[A-Za-z0-9_-]+$/

function getIconClassName(iconHtml) {
  const value = String(iconHtml ?? '').trim()
  const match = value.match(ICON_TAG_PATTERN)
  const classValue = match ? match[1] : value
  const classes = classValue.split(/\s+/).filter(Boolean)

  if (!classes.length || !classes.every((className) => ICON_CLASS_PATTERN.test(className))) {
    return ''
  }

  return classes.some((className) => className.startsWith('fa-') || ['fa', 'fas', 'far', 'fab'].includes(className))
    ? classes.join(' ')
    : ''
}

function CategoryLabel({ category, fallback = '-', iconOnly = false }) {
  if (!category) {
    return fallback
  }

  const iconClassName = getIconClassName(category.icon_html)
  const label = itemLabel(category)

  return (
    <span className={`category-label ${iconOnly ? 'is-icon-only' : ''}`} style={{ color: category.color }} title={iconOnly ? label : undefined}>
      {iconClassName ? (
        <span className="category-label-icon" aria-hidden="true">
          <i className={iconClassName} />
        </span>
      ) : null}
      {iconOnly ? <span className="sr-only">{label}</span> : <span>{label}</span>}
    </span>
  )
}

export default CategoryLabel
