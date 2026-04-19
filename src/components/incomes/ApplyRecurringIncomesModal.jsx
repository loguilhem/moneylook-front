import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquarePlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { getPolicyDate } from '../resource/datePolicyUtils'
import { centsToMoneyInput, moneyInputToCents } from '../resource/resourceUtils'
import { Loader } from '../resource/Loader'
import CategorySelect from '../resource/CategorySelect'

function buildInitialRows(recurringIncomes) {
  return Object.fromEntries(
    recurringIncomes.map((income) => [
      income.id,
      buildRow(income),
    ]),
  )
}

function buildRow(recurringIncome) {
  return {
    amount_cents: centsToMoneyInput(recurringIncome.amount_cents),
    category_id: recurringIncome.category_id ? String(recurringIncome.category_id) : '',
    date: getPolicyDate(recurringIncome.date_policy),
  }
}

function ApplyRecurringIncomesModal({ categories, recurringIncomes, savingIds, onClose, onSave }) {
  const { t } = useTranslation()
  const activeRecurringIncomes = useMemo(
    () => recurringIncomes.filter((income) => income.is_active),
    [recurringIncomes],
  )
  const [appliedIds, setAppliedIds] = useState([])
  const [rows, setRows] = useState(() => buildInitialRows(activeRecurringIncomes))
  const visibleRecurringIncomes = activeRecurringIncomes.filter((income) => !appliedIds.includes(income.id))

  function updateRow(incomeId, fieldName, value) {
    setRows((current) => ({
      ...current,
      [incomeId]: {
        ...current[incomeId],
        [fieldName]: value,
      },
    }))
  }

  async function saveRow(recurringIncome) {
    const row = rows[recurringIncome.id] ?? buildRow(recurringIncome)
    await onSave(recurringIncome, {
      amount_cents: moneyInputToCents(row.amount_cents),
      bank_account_id: recurringIncome.bank_account_id,
      category_id: row.category_id ? Number(row.category_id) : null,
      date: row.date,
      label: recurringIncome.label,
    })
    setAppliedIds((current) => [...current, recurringIncome.id])
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-panel import-modal-panel" aria-modal="true" role="dialog" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{t('incomes.applyRecurring.eyebrow')}</p>
            <h2>{t('incomes.applyRecurring.title')}</h2>
          </div>
        </div>

        <div className="table-wrap compact-table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('resources.fields.label')}</th>
                <th>{t('resources.fields.amount')}</th>
                <th>{t('resources.fields.date')}</th>
                <th>{t('resources.fields.category')}</th>
                <th>{t('incomes.applyRecurring.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecurringIncomes.map((recurringIncome) => {
                const row = rows[recurringIncome.id] ?? buildRow(recurringIncome)
                const isSaving = savingIds.includes(recurringIncome.id)
                const rowAmountCents = moneyInputToCents(row.amount_cents)
                const canSave = Number.isFinite(rowAmountCents) && row.date

                return (
                  <tr key={recurringIncome.id}>
                    <td>{recurringIncome.label}</td>
                    <td>
                      <input
                        className="compact-input"
                        inputMode="decimal"
                        pattern="[0-9]+([,.][0-9]{1,2})?"
                        value={row.amount_cents}
                        onChange={(event) => updateRow(recurringIncome.id, 'amount_cents', event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="compact-input"
                        type="date"
                        value={row.date}
                        onChange={(event) => updateRow(recurringIncome.id, 'date', event.target.value)}
                      />
                    </td>
                    <td>
                      <CategorySelect
                        categories={categories}
                        compact
                        fallback={t('incomes.applyRecurring.noCategory')}
                        optional
                        placeholder={t('incomes.applyRecurring.noCategory')}
                        value={row.category_id}
                        onChange={(nextValue) => updateRow(recurringIncome.id, 'category_id', nextValue)}
                      />
                    </td>
                    <td className="actions">
                      <button
                        aria-label={t('incomes.applyRecurring.save')}
                        disabled={isSaving || !canSave}
                        type="button"
                        onClick={() => saveRow(recurringIncome)}
                      >
                        {isSaving ? <Loader label={t('incomes.applyRecurring.saving')} small /> : <FontAwesomeIcon icon={faSquarePlus} />}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {visibleRecurringIncomes.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan="5">
                    {t('incomes.applyRecurring.empty')}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <button
            aria-label="Annuler"
            className="modal-cancel-button"
            title="Annuler"
            type="button"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      </section>
    </div>
  )
}

export default ApplyRecurringIncomesModal
