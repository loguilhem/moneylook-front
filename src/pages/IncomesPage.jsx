import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import ApplyRecurringIncomesModal from '../components/incomes/ApplyRecurringIncomesModal'
import DateRangeFilter from '../components/resource/DateRangeFilter'
import ResourceFormModal from '../components/resource/ResourceFormModal'
import ResourceImportModal from '../components/resource/ResourceImportModal'
import ResourceList from '../components/resource/ResourceList'
import ResourcePageHeader from '../components/resource/ResourcePageHeader'
import { useResourceCrud } from '../hooks/useResourceCrud'

function formatDateInput(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getCurrentMonthRange() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    dateFrom: formatDateInput(firstDay),
    dateTo: formatDateInput(lastDay),
  }
}

function IncomesPage() {
  const crud = useResourceCrud('incomes')
  const { t } = useTranslation()
  const [isApplyRecurringOpen, setIsApplyRecurringOpen] = useState(false)
  const [savingRecurringIds, setSavingRecurringIds] = useState([])
  const [dateFrom, setDateFrom] = useState(() => getCurrentMonthRange().dateFrom)
  const [dateTo, setDateTo] = useState(() => getCurrentMonthRange().dateTo)
  const filteredData = useMemo(
    () =>
      crud.data.filter((item) => {
        const itemDate = item.date ?? ''
        const matchesStartDate = !dateFrom || itemDate >= dateFrom
        const matchesEndDate = !dateTo || itemDate <= dateTo

        return matchesStartDate && matchesEndDate
      }),
    [crud.data, dateFrom, dateTo],
  )

  async function saveRecurringIncomeRow(recurringIncome, payload) {
    setSavingRecurringIds((current) => [...current, recurringIncome.id])
    try {
      await crud.createItem(payload)
    } finally {
      setSavingRecurringIds((current) => current.filter((id) => id !== recurringIncome.id))
    }
  }

  function setCurrentMonthFilter() {
    const { dateFrom: currentMonthStart, dateTo: currentMonthEnd } = getCurrentMonthRange()
    setDateFrom(currentMonthStart)
    setDateTo(currentMonthEnd)
  }

  return (
    <main className="page-shell">
      <ResourcePageHeader
        canImport={crud.canImport}
        extraActions={
          <button
            className="secondary-button"
            aria-label={t('incomes.applyRecurring.title')}
            disabled={crud.loading}
            title={t('incomes.applyRecurring.title')}
            onClick={() => setIsApplyRecurringOpen(true)}
          >
            <FontAwesomeIcon icon={faLayerGroup} />
          </button>
        }
        loading={crud.loading}
        resource={crud.resource}
        onCreate={crud.openCreateForm}
        onImport={crud.openImport}
        onReload={crud.onReload}
      />

      {crud.error ? <p className="alert">{crud.error}</p> : null}

      <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onCurrentMonth={setCurrentMonthFilter}
      />

      <ResourceList
        columns={crud.columns}
        data={filteredData}
        deletingId={crud.deletingId}
        formId={crud.quickCreateFormId}
        loading={crud.loading}
        lookups={crud.lookups}
        quickForm={crud.quickForm}
        quickSaving={crud.quickSaving}
        resource={crud.resource}
        onDelete={crud.deleteItem}
        onEdit={crud.openEditForm}
        onQuickChange={crud.updateQuickField}
        onQuickSubmit={crud.submitQuickCreate}
      />

      {crud.isFormOpen ? (
        <ResourceFormModal
          editingId={crud.editingId}
          form={crud.form}
          lookups={crud.lookups}
          resource={crud.resource}
          saving={crud.saving}
          onChange={crud.updateField}
          onClose={crud.closeForm}
          onSubmit={crud.submitForm}
        />
      ) : null}

      {crud.isImportOpen ? (
        <ResourceImportModal
          importing={crud.importing}
          resource={crud.resource}
          summary={crud.importSummary}
          onClose={crud.closeImport}
          onImport={crud.importFile}
        />
      ) : null}

      {isApplyRecurringOpen ? (
        <ApplyRecurringIncomesModal
          categories={crud.lookups.categories ?? []}
          recurringIncomes={crud.lookups.recurringIncomes ?? []}
          savingIds={savingRecurringIds}
          onClose={() => setIsApplyRecurringOpen(false)}
          onSave={saveRecurringIncomeRow}
        />
      ) : null}
    </main>
  )
}

export default IncomesPage
