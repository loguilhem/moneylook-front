function toDateInput(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isBusinessDay(date) {
  const day = date.getDay()
  return day !== 0 && day !== 6
}

function getFirstBusinessDay(year, month) {
  const date = new Date(year, month, 1)

  while (!isBusinessDay(date)) {
    date.setDate(date.getDate() + 1)
  }

  return date
}

function getLastBusinessDay(year, month) {
  const date = new Date(year, month + 1, 0)

  while (!isBusinessDay(date)) {
    date.setDate(date.getDate() - 1)
  }

  return date
}

export function getPolicyDate(datePolicy) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  if (datePolicy === 'last_day_of_month') {
    return toDateInput(new Date(year, month + 1, 0))
  }

  if (datePolicy === 'first_business_day') {
    return toDateInput(getFirstBusinessDay(year, month))
  }

  if (datePolicy === 'last_business_day') {
    return toDateInput(getLastBusinessDay(year, month))
  }

  return toDateInput(now)
}
