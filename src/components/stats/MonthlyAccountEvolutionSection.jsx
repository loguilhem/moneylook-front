import { StatTableBody } from './StatTable'

function MonthlyAccountEvolutionSection({ columns, rows, selectedYear, t }) {
  return (
    <section className="table-panel stat-table-panel stats-grid-wide">
      <div className="table-title">
        <h2>{t('stats.monthlyAccountEvolution.title')}</h2>
        <span>{selectedYear}</span>
      </div>
      <StatTableBody columns={columns} rows={rows} t={t} />
    </section>
  )
}

export default MonthlyAccountEvolutionSection
