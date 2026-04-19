import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '../context/AppContext'
import {
  AnnualStatsSection,
  DEFAULT_MONTH_LABELS,
  MonthlyAccountEvolutionSection,
  StatsBreakdownGrid,
  StatsDateFilters,
  StatsOverviewSection,
  StatsPageHeader,
  buildStatsData,
  buildYears,
  getDefaultRange,
} from '../components/stats'

function StatsPage() {
  const { t } = useTranslation()
  const { error, loading, store, loadAll } = useAppContext()
  const defaultRange = useMemo(() => getDefaultRange(), [])
  const allExpenses = store.expenses ?? []
  const allIncomes = store.incomes ?? []
  const bankAccounts = store.bankAccounts ?? []
  const accountTypes = store.accountTypes ?? []
  const categories = store.categories ?? []
  const years = useMemo(() => buildYears(allExpenses, allIncomes), [allExpenses, allIncomes])
  const monthLabels = useMemo(() => {
    const translatedMonths = t('stats.months', { returnObjects: true })
    return Array.isArray(translatedMonths) ? translatedMonths : DEFAULT_MONTH_LABELS
  }, [t])
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate] = useState(defaultRange.endDate)
  const [selectedYear, setSelectedYear] = useState(years[0] ?? new Date().getFullYear())

  const stats = useMemo(
    () =>
      buildStatsData({
        accountTypes,
        allExpenses,
        allIncomes,
        bankAccounts,
        categories,
        endDate,
        monthColumnLabel: t('stats.columns.month'),
        monthLabels,
        selectedYear,
        startDate,
      }),
    [accountTypes, allExpenses, allIncomes, bankAccounts, categories, endDate, monthLabels, selectedYear, startDate, t],
  )

  return (
    <main className="page-shell">
      <StatsPageHeader loading={loading} onReload={loadAll} t={t} />

      <StatsDateFilters
        endDate={endDate}
        onEndDateChange={setEndDate}
        onStartDateChange={setStartDate}
        startDate={startDate}
        t={t}
      />

      {error ? <p className="alert">{error}</p> : null}

      {loading ? (
        <p className="inline-loader">
          <span className="loader-spinner" aria-hidden="true" />
          {t('stats.loading')}
        </p>
      ) : null}

      <StatsOverviewSection stats={stats} t={t} />

      <section className="stats-grid" aria-label={t('stats.details')}>
        <StatsBreakdownGrid stats={stats} t={t} />
        <AnnualStatsSection
          annualRows={stats.annualRows}
          onYearChange={setSelectedYear}
          selectedYear={selectedYear}
          t={t}
          years={years}
        />
        <MonthlyAccountEvolutionSection
          columns={stats.monthlyAccountColumns}
          rows={stats.monthlyAccountRows}
          selectedYear={selectedYear}
          t={t}
        />
      </section>
    </main>
  )
}

export default StatsPage
