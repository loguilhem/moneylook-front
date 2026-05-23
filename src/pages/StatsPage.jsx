import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '../context/AppContext'
import {
  AnnualStatsSection,
  CategoryExpenseProgressChart,
  DEFAULT_MONTH_LABELS,
  MonthlyAccountEvolutionChart,
  StatTable,
  StatsBreakdownGrid,
  StatsDateFilters,
  StatsOverviewSection,
  StatsPageHeader,
  buildStatsData,
  buildYears,
  getDefaultRange,
} from '../components/stats'

function StatsPage() {
  const { i18n, t } = useTranslation()
  const { error, loading, store, loadAll } = useAppContext()
  const defaultRange = useMemo(() => getDefaultRange(), [])
  const allExpenses = useMemo(() => store.expenses ?? [], [store.expenses])
  const allIncomes = useMemo(() => store.incomes ?? [], [store.incomes])
  const bankAccounts = useMemo(() => store.bankAccounts ?? [], [store.bankAccounts])
  const accountTypes = useMemo(() => store.accountTypes ?? [], [store.accountTypes])
  const categories = useMemo(() => store.categories ?? [], [store.categories])
  const years = useMemo(() => buildYears(allExpenses, allIncomes), [allExpenses, allIncomes])
  const monthLabels = useMemo(() => {
    const translatedMonths = t('stats.months', { returnObjects: true })
    return Array.isArray(translatedMonths) ? translatedMonths : DEFAULT_MONTH_LABELS
  }, [t])
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate] = useState(defaultRange.endDate)
  const [selectedYear, setSelectedYear] = useState(years[0] ?? new Date().getFullYear())
  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat(i18n.language).format(new Date()),
    [i18n.language],
  )

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

      <section className="stats-section" aria-labelledby="selected-period-stats-title">
        <div className="stats-section-heading">
          <h2 id="selected-period-stats-title">{t('stats.selectedPeriod.title')}</h2>
        </div>
        <StatsOverviewSection stats={stats} t={t} />
        <div className="stats-grid" aria-label={t('stats.details')}>
          <StatsBreakdownGrid stats={stats} t={t} />
        </div>
      </section>

      <section className="stats-section stats-annual-section" aria-labelledby="annual-stats-title">
        <div className="stats-section-heading">
          <h2 id="annual-stats-title">{t('stats.annualSection.title')}</h2>
        </div>
        <div className="stats-grid" aria-label={t('stats.annualSection.title')}>
          <AnnualStatsSection
            annualRows={stats.annualRows}
            onYearChange={setSelectedYear}
            selectedYear={selectedYear}
            t={t}
            years={years}
          />
          <StatTable
            columns={[
              { key: 'account_type', label: t('resources.fields.accountType') },
              { key: 'amount_cents', label: t('resources.fields.amount'), type: 'money' },
            ]}
            rows={stats.accountTypeRows}
            title={t('stats.treasurySavings.currentBalanceTitle', { date: todayLabel })}
            t={t}
          />
          <CategoryExpenseProgressChart
            columns={stats.annualCategoryExpenseColumns}
            rows={stats.annualCategoryExpenseRows}
            t={t}
          />
          <MonthlyAccountEvolutionChart
            columns={stats.monthlyAccountColumns}
            rows={stats.monthlyAccountRows}
            selectedYear={selectedYear}
            t={t}
          />
        </div>
      </section>
    </main>
  )
}

export default StatsPage
