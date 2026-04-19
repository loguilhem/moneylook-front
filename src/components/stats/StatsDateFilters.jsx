function StatsDateFilters({ endDate, onEndDateChange, onStartDateChange, startDate, t }) {
  return (
    <section className="stats-filters" aria-label={t('stats.filters')}>
      <label>
        <span>{t('stats.startDate')}</span>
        <input type="date" value={startDate} required onChange={(event) => onStartDateChange(event.target.value)} />
      </label>
      <label>
        <span>{t('stats.endDate')}</span>
        <input type="date" value={endDate} required onChange={(event) => onEndDateChange(event.target.value)} />
      </label>
    </section>
  )
}

export default StatsDateFilters
