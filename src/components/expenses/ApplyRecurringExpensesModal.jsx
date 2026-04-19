import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquarePlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { centsToMoneyInput, moneyInputToCents } from '../resource/resourceUtils'
import { getPolicyDate } from '../resource/datePolicyUtils'
import { Loader } from '../resource/Loader'
import CategorySelect from '../resource/CategorySelect'

function buildInitialRows(recurringExpenses) {
  return Object.fromEntries(
    recurringExpenses.map((expense) => [
      expense.id,
      buildRow(expense),
    ]),
  )
}

function buildRow(recurringExpense) {
  return {
    amount_cents: centsToMoneyInput(recurringExpense.amount_cents),
    category_id: String(recurringExpense.category_id),
    date: getPolicyDate(recurringExpense.date_policy),
  }
}

function ApplyRecurringExpensesModal({ categories, recurringExpenses, savingIds, onClose, onSave }) {
  const { t } = useTranslation()
  const activeRecurringExpenses = useMemo(
    () => recurringExpenses.filter((expense) => expense.is_active),
    [recurringExpenses],
  )
  const [appliedIds, setAppliedIds] = useState([])
  const [rows, setRows] = useState(() => buildInitialRows(activeRecurringExpenses))
  const visibleRecurringExpenses = activeRecurringExpenses.filter((expense) => !appliedIds.includes(expense.id))

  function updateRow(expenseId, fieldName, value) {
    setRows((current) => ({
      ...current,
      [expenseId]: {
        ...current[expenseId],
        [fieldName]: value,
      },
    }))
  }

  async function saveRow(recurringExpense) {
    const row = rows[recurringExpense.id] ?? buildRow(recurringExpense)
    await onSave(recurringExpense, {
      amount_cents: moneyInputToCents(row.amount_cents),
      bank_account_id: recurringExpense.bank_account_id,
      category_id: Number(row.category_id),
      date: row.date,
      label: recurringExpense.label,
    })
    setAppliedIds((current) => [...current, recurringExpense.id])
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-panel import-modal-panel" aria-modal="true" role="dialog" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{t('expenses.applyRecurring.eyebrow')}</p>
            <h2>{t('expenses.applyRecurring.title')}</h2>
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
                <th>{t('expenses.applyRecurring.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecurringExpenses.map((recurringExpense) => {
                const row = rows[recurringExpense.id] ?? buildRow(recurringExpense)
                const isSaving = savingIds.includes(recurringExpense.id)
                const rowAmountCents = moneyInputToCents(row.amount_cents)
                const canSave = Number.isFinite(rowAmountCents) && row.date && row.category_id

                return (
                  <tr key={recurringExpense.id}>
                    <td>{recurringExpense.label}</td>
                    <td>
                      <input
                        className="compact-input"
                        inputMode="decimal"
                        pattern="[0-9]+([,.][0-9]{1,2})?"
                        value={row.amount_cents}
                        onChange={(event) => updateRow(recurringExpense.id, 'amount_cents', event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="compact-input"
                        type="date"
                        value={row.date}
                        onChange={(event) => updateRow(recurringExpense.id, 'date', event.target.value)}
                      />
                    </td>
                    <td>
                      <CategorySelect
                        categories={categories}
                        compact
                        value={row.category_id}
                        onChange={(nextValue) => updateRow(recurringExpense.id, 'category_id', nextValue)}
                      />
                    </td>
                    <td className="actions">
                      <button
                        aria-label={t('expenses.applyRecurring.save')}
                        disabled={isSaving || !canSave}
                        type="button"
                        onClick={() => saveRow(recurringExpense)}
                      >
                        {isSaving ? <Loader label={t('expenses.applyRecurring.saving')} small /> : <FontAwesomeIcon icon={faSquarePlus} />}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {visibleRecurringExpenses.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan="5">
                    {t('expenses.applyRecurring.empty')}
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

export default ApplyRecurringExpensesModal
