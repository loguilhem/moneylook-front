import CategoryLabel from '../resource/CategoryLabel'
import { formatMoney, formatPercent } from './statsFormatters'

function StatTable({ title, columns, rows, t }) {
  return (
    <section className="table-panel stat-table-panel">
      <div className="table-title">
        <h2>{title}</h2>
        <span>{t('stats.rowsCount', { count: rows.length })}</span>
      </div>
      <StatTableBody columns={columns} rows={rows} t={t} />
    </section>
  )
}

export function StatTableBody({ columns, rows, t }) {
  return (
    <div className="table-wrap compact-table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${columns[0].key}-${index}`}>
              {columns.map((column) => (
                <td key={column.key}>{formatCell(row, column)}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="empty-cell" colSpan={columns.length}>
                {t('resources.noData')}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

function formatCell(row, column) {
  const value = row[column.key]

  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (column.type === 'money') {
    return formatMoney(value, column.currency ?? row.currency)
  }

  if (column.type === 'percent') {
    return formatPercent(value)
  }

  if (column.key === 'category') {
    return <CategoryLabel category={value} />
  }

  return value
}

export default StatTable
