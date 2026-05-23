import { useMemo, useState } from 'react'
import CategoryLabel from '../resource/CategoryLabel'
import { StatTableBody } from './StatTable'
import { formatMoney, formatPercent } from './statsFormatters'

function StatsBreakdownGrid({ stats, t }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [selectedChildCategoryId, setSelectedChildCategoryId] = useState(null)
  const selectedCategoryRow = useMemo(
    () => stats.categoryRows.find((row) => String(row.category?.id) === String(selectedCategoryId)) ?? null,
    [selectedCategoryId, stats.categoryRows],
  )
  const selectedDetails = selectedCategoryRow?.category?.id
    ? stats.categoryDetailsByParent?.[selectedCategoryRow.category.id]
    : null
  const selectedChildRow = useMemo(
    () => selectedDetails?.childRows?.find((row) => String(row.category?.id) === String(selectedChildCategoryId)) ?? null,
    [selectedChildCategoryId, selectedDetails],
  )
  const selectedExpenseRows = useMemo(() => {
    const expenseRows = selectedDetails?.expenseRows ?? []

    if (!selectedChildRow?.category?.id) {
      return expenseRows
    }

    return expenseRows.filter((expense) => String(expense.category?.id) === String(selectedChildRow.category.id))
  }, [selectedChildRow, selectedDetails])
  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId)
    setSelectedChildCategoryId(null)
  }

  return (
    <>
      <div className="stats-category-grid">
        <ExpenseDistributionTable
          rows={stats.categoryRows}
          selectedCategoryId={selectedCategoryId}
          t={t}
          onSelectCategory={handleSelectCategory}
        />
        <ExpenseCategoryDetailsPanel
          details={selectedDetails}
          selectedChildCategoryId={selectedChildCategoryId}
          selectedCategory={selectedCategoryRow?.category}
          t={t}
          onSelectChildCategory={setSelectedChildCategoryId}
        />
        <ExpenseRowsPanel
          rows={selectedExpenseRows}
          selectedCategory={selectedChildRow?.category ?? selectedCategoryRow?.category}
          t={t}
        />
      </div>
    </>
  )
}

function ExpenseDistributionTable({ rows, selectedCategoryId, t, onSelectCategory }) {
  return (
    <section className="table-panel stat-table-panel">
      <div className="table-title">
        <h2>{t('stats.expenseDistribution.title')}</h2>
        <span>{t('stats.rowsCount', { count: rows.length })}</span>
      </div>
      <div className="table-wrap compact-table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('resources.fields.category')}</th>
              <th>{t('stats.columns.total')}</th>
              <th>{t('stats.columns.percentage')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const categoryId = row.category?.id
              const isSelected = String(categoryId) === String(selectedCategoryId)

              return (
                <tr className={isSelected ? 'is-selected' : ''} key={categoryId ?? row.category?.name}>
                  <td>
                    <button
                      className="stat-category-button"
                      type="button"
                      onClick={() => onSelectCategory(categoryId)}
                    >
                      <CategoryLabel category={row.category} />
                    </button>
                  </td>
                  <td>{formatMoney(row.total_cents)}</td>
                  <td>{formatPercent(row.percentage)}</td>
                </tr>
              )
            })}
            {rows.length === 0 ? (
              <tr>
                <td className="empty-cell" colSpan="3">
                  {t('resources.noData')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ExpenseCategoryDetailsPanel({ details, selectedCategory, selectedChildCategoryId, t, onSelectChildCategory }) {
  const childRows = details?.childRows ?? []

  return (
    <section className="table-panel stat-table-panel expense-category-details-panel">
      {selectedCategory ? (
        <div className="expense-category-details">
          <div className="expense-category-detail-block">
            <h3>{t('stats.expenseDistribution.childrenTitle')}</h3>
            <div className="table-wrap compact-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('resources.fields.category')}</th>
                    <th>{t('stats.columns.total')}</th>
                    <th>{t('stats.columns.percentage')}</th>
                  </tr>
                </thead>
                <tbody>
                  {childRows.map((row) => {
                    const categoryId = row.category?.id
                    const isSelected = String(categoryId) === String(selectedChildCategoryId)

                    return (
                      <tr className={isSelected ? 'is-selected' : ''} key={categoryId ?? row.category?.name}>
                        <td>
                          <button
                            className="stat-category-button"
                            type="button"
                            onClick={() => onSelectChildCategory(categoryId)}
                          >
                            <CategoryLabel category={row.category} />
                          </button>
                        </td>
                        <td>{formatMoney(row.total_cents)}</td>
                        <td>{formatPercent(row.percentage)}</td>
                      </tr>
                    )
                  })}
                  {childRows.length === 0 ? (
                    <tr>
                      <td className="empty-cell" colSpan="3">
                        {t('resources.noData')}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p className="expense-category-details-empty">{t('stats.expenseDistribution.selectParent')}</p>
      )}
    </section>
  )
}

function ExpenseRowsPanel({ rows, selectedCategory, t }) {
  return (
    <section className="table-panel stat-table-panel expense-category-details-panel">
      <div className="table-title">
        <h2>{t('stats.expenseDistribution.expensesTitle')}</h2>
        <span>{t('stats.rowsCount', { count: rows.length })}</span>
      </div>
      {selectedCategory ? (
        <StatTableBody
          columns={[
            { key: 'date', label: t('resources.fields.date') },
            { key: 'label', label: t('resources.fields.label') },
            { key: 'category', label: t('resources.fields.category') },
            { key: 'amount_cents', label: t('resources.fields.amount'), type: 'money' },
          ]}
          rows={rows}
          t={t}
        />
      ) : (
        <p className="expense-category-details-empty">{t('stats.expenseDistribution.selectParent')}</p>
      )}
    </section>
  )
}

export default StatsBreakdownGrid
