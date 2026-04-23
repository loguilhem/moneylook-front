import { useTranslation } from 'react-i18next'

function DateRangeFilter({
  dateFrom,
  dateTo,
  onCurrentMonth,
  onDateFromChange,
  onDateToChange,
}) {
  const { t } = useTranslation()

  return (
    <section className="date-range-filter-panel">
      <div className="date-range-filter-fields">
        <label>
          <span>{t('stats.startDate')}</span>
          <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} />
        </label>

        <label>
          <span>{t('stats.endDate')}</span>
          <input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} />
        </label>
      </div>

      <button className="secondary-button" type="button" onClick={onCurrentMonth}>
        {t('common.currentMonth')}
      </button>
    </section>
  )
}

export default DateRangeFilter
