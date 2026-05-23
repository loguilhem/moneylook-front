import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney } from './statsFormatters'

const FALLBACK_COLORS = ['#00aeef', '#11b69a', '#f4a261', '#e76f51', '#5c7cfa', '#ef476f', '#8ac926', '#ffca3a']

function CategoryExpenseProgressChart({ columns, rows, t }) {
  const [hiddenKeys, setHiddenKeys] = useState([])
  const visibleColumns = useMemo(
    () => columns.filter((column) => !hiddenKeys.includes(column.key)),
    [columns, hiddenKeys],
  )

  function toggleColumn(data) {
    const key = data?.dataKey

    if (!key) {
      return
    }

    setHiddenKeys((currentKeys) =>
      currentKeys.includes(key)
        ? currentKeys.filter((currentKey) => currentKey !== key)
        : [...currentKeys, key],
    )
  }

  return (
    <section className="table-panel stat-chart-panel">
      <div className="table-title">
        <h2>{t('stats.annual.categoryProgressTitle')}</h2>
        <span>{t('stats.rowsCount', { count: visibleColumns.length })}</span>
      </div>
      {columns.length > 0 ? (
        <div className="recharts-shell">
          <ResponsiveContainer height={340} width="100%">
            <LineChart data={rows} margin={{ bottom: 8, left: 12, right: 18, top: 12 }}>
              <CartesianGrid strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="month" tickLine={false} />
              <YAxis tickFormatter={(value) => formatMoney(value)} tickLine={false} width={96} />
              <Tooltip formatter={(value, name) => [formatMoney(value), name]} />
              <Legend onClick={toggleColumn} wrapperStyle={{ cursor: 'pointer' }} />
              {columns.map((column, index) => (
                <Line
                  activeDot={{ r: 5 }}
                  dataKey={column.key}
                  dot={false}
                  hide={hiddenKeys.includes(column.key)}
                  key={column.key}
                  name={column.label}
                  stroke={column.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                  strokeWidth={2}
                  type="monotone"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="chart-empty-state">{t('resources.noData')}</p>
      )}
    </section>
  )
}

export default CategoryExpenseProgressChart
