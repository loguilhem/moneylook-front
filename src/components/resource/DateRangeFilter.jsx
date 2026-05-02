import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faXmark } from '@fortawesome/free-solid-svg-icons'

function openNativeDatePicker(event) {
  try {
    event.currentTarget.showPicker?.()
  } catch {
    // Some mobile browsers expose showPicker but reject programmatic opening.
  }
}

function DateRangeFilter({
  dateFrom,
  isOpen = true,
  modal = false,
  onClose = null,
  dateTo,
  onCurrentMonth,
  onDateFromChange,
  onDateToChange,
  onOpen = null,
}) {
  const { t } = useTranslation()

  if (modal) {
    return (
      <>
        <section className="date-range-filter-toolbar">
          <button
            className="secondary-button"
            type="button"
            aria-label={t('stats.filters')}
            title={t('stats.filters')}
            onClick={onOpen}
          >
            <FontAwesomeIcon icon={faCalendarDays} />
          </button>
          <button className="secondary-button" type="button" onClick={onCurrentMonth}>
            {t('common.currentMonth')}
          </button>
        </section>

        {isOpen ? (
          <div className="modal-backdrop" role="presentation">
            <section className="modal-panel date-filter-modal" role="dialog" aria-modal="true" aria-labelledby="date-filter-title">
              <header className="modal-header">
                <h2 id="date-filter-title">{t('stats.filters')}</h2>
                <button className="modal-cancel-button" type="button" aria-label={t('common.close')} onClick={onClose}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </header>
              <div className="date-range-filter-fields">
                <label>
                  <span>{t('stats.startDate')}</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onClick={openNativeDatePicker}
                    onFocus={openNativeDatePicker}
                    onChange={(event) => onDateFromChange(event.target.value)}
                  />
                </label>

                <label>
                  <span>{t('stats.endDate')}</span>
                  <input
                    type="date"
                    value={dateTo}
                    onClick={openNativeDatePicker}
                    onFocus={openNativeDatePicker}
                    onChange={(event) => onDateToChange(event.target.value)}
                  />
                </label>
              </div>
            </section>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <section className="date-range-filter-panel">
      <div className="date-range-filter-fields">
        <label>
          <span>{t('stats.startDate')}</span>
          <input
            type="date"
            value={dateFrom}
            onClick={openNativeDatePicker}
            onFocus={openNativeDatePicker}
            onChange={(event) => onDateFromChange(event.target.value)}
          />
        </label>

        <label>
          <span>{t('stats.endDate')}</span>
          <input
            type="date"
            value={dateTo}
            onClick={openNativeDatePicker}
            onFocus={openNativeDatePicker}
            onChange={(event) => onDateToChange(event.target.value)}
          />
        </label>
      </div>

      <button className="secondary-button" type="button" onClick={onCurrentMonth}>
        {t('common.currentMonth')}
      </button>
    </section>
  )
}

export default DateRangeFilter
