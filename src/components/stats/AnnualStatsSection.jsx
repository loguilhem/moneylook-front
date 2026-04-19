import { StatTableBody } from './StatTable'

function AnnualStatsSection({ annualRows, onYearChange, selectedYear, t, years }) {
  return (
    <section className="table-panel stat-table-panel">
      <div className="table-title annual-table-title">
        <h2>{t('stats.annual.title')}</h2>
        <label>
          <span>{t('stats.year')}</span>
          <select value={selectedYear} onChange={(event) => onYearChange(Number(event.target.value))}>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      <StatTableBody
        columns={[
          { key: 'month', label: t('stats.columns.month') },
          { key: 'income_cents', label: t('stats.cards.totalIncome'), type: 'money' },
          { key: 'expense_cents', label: t('stats.cards.totalExpense'), type: 'money' },
        ]}
        rows={annualRows}
        t={t}
      />
    </section>
  )
}

export default AnnualStatsSection
