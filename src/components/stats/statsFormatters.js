export function formatMoney(cents, currency = 'CHF') {
  try {
    return new Intl.NumberFormat('fr-CH', {
      currency,
      style: 'currency',
    }).format((Number(cents) || 0) / 100)
  } catch {
    return `${((Number(cents) || 0) / 100).toFixed(2)} ${currency}`
  }
}

export function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)} %`
}
