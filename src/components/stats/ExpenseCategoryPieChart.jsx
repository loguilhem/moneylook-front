import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatMoney, formatPercent } from './statsFormatters'

const FALLBACK_COLORS = ['#00aeef', '#11b69a', '#f4a261', '#e76f51', '#5c7cfa', '#ef476f', '#8ac926', '#ffca3a']

function ExpenseCategoryPieChart({ rows, t }) {
  const data = rows
    .filter((row) => Number(row.total_cents) > 0)
    .map((row, index) => ({
      color: row.category?.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      name: row.category?.name ?? '-',
      percentage: row.percentage,
      value: row.total_cents,
    }))

  return (
    <section className="table-panel stat-chart-panel stats-grid-wide">
      <div className="table-title">
        <h2>{t('stats.expenseDistribution.pieTitle')}</h2>
        <span>{t('stats.rowsCount', { count: data.length })}</span>
      </div>
      {data.length > 0 ? (
        <div className="recharts-shell pie-chart-shell">
          <ResponsiveContainer height={300} width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={data}
                dataKey="value"
                innerRadius={62}
                nameKey="name"
                outerRadius={104}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell fill={entry.color} key={entry.name} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, item) => [
                  `${formatMoney(value)} (${formatPercent(item.payload.percentage)})`,
                  name,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="chart-empty-state">{t('resources.noData')}</p>
      )}
    </section>
  )
}

export default ExpenseCategoryPieChart
