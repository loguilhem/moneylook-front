import { useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate } from '@fortawesome/free-solid-svg-icons'
import { useAppContext } from '../context/AppContext'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

const statTables = [
  {
    key: 'expensesByCategory',
    title: 'Dépenses par catégorie',
    columns: [
      { key: 'category_name', label: 'Catégorie' },
      { key: 'total_cents', label: 'Total', type: 'money' },
    ],
  },
  {
    key: 'expensesByCategoryPercent',
    title: 'Dépenses par catégorie (%)',
    columns: [
      { key: 'category_name', label: 'Catégorie' },
      { key: 'total_cents', label: 'Total', type: 'money' },
      { key: 'percentage', label: '%', type: 'percent' },
    ],
  },
  {
    key: 'expensesByAccount',
    title: 'Dépenses par compte',
    columns: [
      { key: 'bank_account_label', label: 'Compte' },
      { key: 'total_cents', label: 'Total', type: 'money' },
    ],
  },
  {
    key: 'expensesByMonth',
    title: 'Dépenses par mois',
    columns: [
      { key: 'month', label: 'Mois' },
      { key: 'total_cents', label: 'Total', type: 'money' },
    ],
  },
]

const statRequests = [
  { key: 'totalExpenses', label: 'total des dépenses', endpoint: '/stats/expenses/total' },
  { key: 'totalIncomes', label: 'total des revenus', endpoint: '/stats/incomes/total' },
  { key: 'balance', label: 'balance', endpoint: '/stats/balance' },
  { key: 'expensesByCategory', label: 'dépenses par catégorie', endpoint: '/stats/expenses/by-category' },
  {
    key: 'expensesByCategoryPercent',
    label: 'dépenses par catégorie en pourcentage',
    endpoint: '/stats/expenses/by-category-percent',
  },
  { key: 'expensesByAccount', label: 'dépenses par compte', endpoint: '/stats/expenses/by-account' },
  { key: 'expensesByMonth', label: 'dépenses par mois', endpoint: '/stats/expenses/by-month' },
]

function toDateInput(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDefaultRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    startDate: toDateInput(start),
    endDate: toDateInput(end),
  }
}

function isActiveRecurringItem(item) {
  return item.is_active
}

function toMonthlyCents(item) {
  const amountCents = Number(item.amount_cents ?? 0)

  if (item.frequency === 'weekly') {
    return amountCents * 52 / 12
  }

  if (item.frequency === 'yearly') {
    return amountCents / 12
  }

  return amountCents
}

function getMonthlyRecurringTotal(items) {
  return Math.round(
    items
      .filter(isActiveRecurringItem)
      .reduce((total, item) => total + toMonthlyCents(item), 0)
  )
}

async function requestStats(endpoint, startDate, endDate) {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  })

  const response = await fetch(`${API_BASE_URL}${endpoint}?${params.toString()}`, {
    credentials: 'include',
  })
  if (!response.ok) {
    const message = await response.text()
    const error = new Error(message || `Erreur HTTP ${response.status}`)
    error.status = response.status
    throw error
  }

  return response.json()
}

function formatMoney(cents) {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format((cents ?? 0) / 100)
}

function formatCell(value, type) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (type === 'money') {
    return formatMoney(value)
  }

  if (type === 'percent') {
    return `${Number(value).toFixed(2)} %`
  }

  return value
}

function StatsPage() {
  const { logout, store } = useAppContext()
  const defaultRange = useMemo(() => getDefaultRange(), [])
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate] = useState(defaultRange.endDate)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const theoreticalMonthlyBudgetCents = useMemo(() => {
    const recurringIncomeCents = getMonthlyRecurringTotal(store.recurringIncomes ?? [])
    const recurringExpenseCents = getMonthlyRecurringTotal(store.recurringExpenses ?? [])

    return recurringIncomeCents - recurringExpenseCents
  }, [store.recurringExpenses, store.recurringIncomes])

  const fetchStats = useCallback(async (rangeStart, rangeEnd) => {
    setLoading(true)
    setError('')

    try {
      const results = await Promise.allSettled(
        statRequests.map((statRequest) => requestStats(statRequest.endpoint, rangeStart, rangeEnd)),
      )
      const nextStats = {}
      const failedStats = []

      let hasUnauthorized = false
      results.forEach((result, index) => {
        const statRequest = statRequests[index]
        if (result.status === 'fulfilled') {
          nextStats[statRequest.key] = result.value
          return
        }

        if (result.reason.status === 401) {
          hasUnauthorized = true
        }
        failedStats.push(`${statRequest.label}: ${result.reason.message}`)
      })

      if (hasUnauthorized) {
        await logout()
        return
      }

      setStats(nextStats)
      if (failedStats.length > 0) {
        setError(`Certaines stats n'ont pas pu être chargées: ${failedStats.join(' | ')}`)
      }
    } catch (statsError) {
      setError(`Impossible de charger les stats: ${statsError.message}`)
    } finally {
      setLoading(false)
    }
  }, [logout])

  function loadStats(event) {
    event.preventDefault()
    fetchStats(startDate, endDate)
  }

  useEffect(() => {
    fetchStats(defaultRange.startDate, defaultRange.endDate)
  }, [defaultRange, fetchStats])

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Stats</p>
          <h1>Vue d'ensemble</h1>
        </div>
      </header>

      <form className="stats-filters" onSubmit={loadStats}>
        <label>
          <span>Début</span>
          <input type="date" value={startDate} required onChange={(event) => setStartDate(event.target.value)} />
        </label>
        <label>
          <span>Fin</span>
          <input type="date" value={endDate} required onChange={(event) => setEndDate(event.target.value)} />
        </label>
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? 'Chargement...' : <FontAwesomeIcon icon={faRotate} />}
        </button>
      </form>

      {error ? <p className="alert">{error}</p> : null}
      {loading ? (
        <p className="inline-loader">
          <span className="loader-spinner" aria-hidden="true" />
          Chargement des stats
        </p>
      ) : null}

      <section className="stats-summary" aria-label="Synthèse">
        <StatCard label="Revenus" value={formatMoney(stats?.totalIncomes?.total_cents)} />
        <StatCard label="Dépenses" value={formatMoney(stats?.totalExpenses?.total_cents)} />
        <StatCard
          label="Balance"
          tone={(stats?.balance?.balance_cents ?? 0) >= 0 ? 'positive' : 'negative'}
          value={formatMoney(stats?.balance?.balance_cents)}
        />
        <StatCard
          label="Budget mensuel théorique"
          tone={theoreticalMonthlyBudgetCents >= 0 ? 'positive' : 'negative'}
          value={formatMoney(theoreticalMonthlyBudgetCents)}
        />
      </section>

      <section className="stats-grid" aria-label="Détails">
        {statTables.map((table) => (
          <StatTable
            columns={table.columns}
            key={table.key}
            rows={stats?.[table.key] ?? []}
            title={table.title}
          />
        ))}
      </section>
    </main>
  )
}

function StatCard({ label, value, tone = '' }) {
  return (
    <article className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function StatTable({ title, columns, rows }) {
  return (
    <section className="table-panel stat-table-panel">
      <div className="table-title">
        <h2>{title}</h2>
        <span>{rows.length} ligne(s)</span>
      </div>
      <div className="table-wrap compact-table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`}>
                {columns.map((column) => (
                  <td key={column.key}>{formatCell(row[column.key], column.type)}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="empty-cell" colSpan={columns.length}>
                  Aucune donnée.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default StatsPage
