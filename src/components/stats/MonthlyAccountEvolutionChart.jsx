import { useEffect, useMemo, useState } from 'react'
import { formatMoney } from './statsFormatters'

const CHART_COLORS = ['#00aeef', '#11b69a', '#f4a261', '#e76f51', '#5c7cfa', '#ef476f', '#8ac926', '#ffca3a']

function buildSeries(columns, rows) {
  return columns
    .filter((column) => column.key !== 'month')
    .map((column, index) => ({
      color: CHART_COLORS[index % CHART_COLORS.length],
      currency: column.currency,
      key: column.key,
      label: column.label,
      points: rows.map((row) => ({
        label: row.month,
        value: Number(row[column.key] ?? 0),
      })),
    }))
}

function buildPath(points, width, height, minValue, maxValue) {
  if (points.length === 0) {
    return ''
  }

  const xStep = points.length > 1 ? width / (points.length - 1) : width / 2
  const valueRange = maxValue - minValue || 1

  return points
    .map((point, index) => {
      const x = points.length > 1 ? index * xStep : width / 2
      const y = height - ((point.value - minValue) / valueRange) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function getYAxisValues(minValue, maxValue) {
  if (minValue === maxValue) {
    return [minValue]
  }

  return Array.from({ length: 5 }, (_, index) => maxValue - ((maxValue - minValue) / 4) * index)
}

function MonthlyAccountEvolutionChart({ columns, rows, t }) {
  const allSeries = useMemo(() => buildSeries(columns, rows), [columns, rows])
  const [selectedKeys, setSelectedKeys] = useState(() => allSeries.map((serie) => serie.key))

  useEffect(() => {
    setSelectedKeys((currentKeys) => {
      const availableKeys = new Set(allSeries.map((serie) => serie.key))
      const nextKeys = currentKeys.filter((key) => availableKeys.has(key))

      return nextKeys.length > 0 ? nextKeys : allSeries.map((serie) => serie.key)
    })
  }, [allSeries])

  const selectedSeries = useMemo(
    () => allSeries.filter((serie) => selectedKeys.includes(serie.key)),
    [allSeries, selectedKeys],
  )
  const values = selectedSeries.flatMap((serie) => serie.points.map((point) => point.value))
  const minValue = values.length > 0 ? Math.min(...values) : 0
  const maxValue = values.length > 0 ? Math.max(...values) : 0
  const yAxisValues = getYAxisValues(minValue, maxValue)
  const chartWidth = 720
  const chartHeight = 280
  const yAxisLabelsWidth = 96
  const chartAreaWidth = chartWidth - yAxisLabelsWidth - 12
  const chartAreaHeight = chartHeight - 54
  const chartAreaX = yAxisLabelsWidth
  const chartAreaY = 14
  const xStep = rows.length > 1 ? chartAreaWidth / (rows.length - 1) : chartAreaWidth / 2

  function toggleKey(key) {
    setSelectedKeys((currentKeys) =>
      currentKeys.includes(key) ? currentKeys.filter((currentKey) => currentKey !== key) : [...currentKeys, key],
    )
  }

  return (
    <section className="table-panel stat-chart-panel stats-grid-wide">
      <div className="table-title">
        <h2>{t('stats.monthlyAccountEvolution.chartTitle')}</h2>
        <span>{t('stats.monthlyAccountEvolution.chartHint')}</span>
      </div>

      <div className="chart-filters">
        {allSeries.map((serie) => {
          const isSelected = selectedKeys.includes(serie.key)

          return (
            <button
              className={`chart-filter-chip ${isSelected ? 'is-selected' : ''}`}
              key={serie.key}
              type="button"
              onClick={() => toggleKey(serie.key)}
            >
              <span className="chart-filter-swatch" style={{ backgroundColor: serie.color }} />
              <span>{serie.label}</span>
            </button>
          )
        })}
      </div>

      {selectedSeries.length > 0 ? (
        <div className="chart-shell">
          <svg
            className="line-chart"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label={t('stats.monthlyAccountEvolution.chartTitle')}
          >
            {yAxisValues.map((value) => {
              const ratio = maxValue === minValue ? 0.5 : (value - minValue) / (maxValue - minValue)
              const y = chartAreaY + chartAreaHeight - ratio * chartAreaHeight

              return (
                <g key={value}>
                  <line
                    className="line-chart-grid-line"
                    x1={chartAreaX}
                    x2={chartAreaX + chartAreaWidth}
                    y1={y}
                    y2={y}
                  />
                  <text className="line-chart-axis-label" x={chartAreaX - 12} y={y + 5} textAnchor="end">
                    {formatMoney(value)}
                  </text>
                </g>
              )
            })}

            {rows.map((row, index) => {
              const x = rows.length > 1 ? chartAreaX + index * xStep : chartAreaX + chartAreaWidth / 2

              return (
                <text
                  className="line-chart-axis-label"
                  key={row.month}
                  x={x}
                  y={chartAreaY + chartAreaHeight + 30}
                  textAnchor="middle"
                >
                  {row.month}
                </text>
              )
            })}

            {selectedSeries.map((serie) => (
              <g key={serie.key}>
                <path
                  className="line-chart-path"
                  d={buildPath(serie.points, chartAreaWidth, chartAreaHeight, minValue, maxValue)}
                  stroke={serie.color}
                  transform={`translate(${chartAreaX} ${chartAreaY})`}
                />
                {serie.points.map((point, index) => {
                  const x = rows.length > 1 ? chartAreaX + index * xStep : chartAreaX + chartAreaWidth / 2
                  const ratio = maxValue === minValue ? 0.5 : (point.value - minValue) / (maxValue - minValue)
                  const y = chartAreaY + chartAreaHeight - ratio * chartAreaHeight

                  return (
                    <g key={`${serie.key}-${point.label}`}>
                      <circle className="line-chart-point" cx={x} cy={y} fill={serie.color} r="3" />
                      <title>{`${serie.label} - ${point.label}: ${formatMoney(point.value, serie.currency)}`}</title>
                    </g>
                  )
                })}
              </g>
            ))}
          </svg>
        </div>
      ) : (
        <p className="chart-empty-state">{t('stats.monthlyAccountEvolution.chartEmpty')}</p>
      )}
    </section>
  )
}

export default MonthlyAccountEvolutionChart
