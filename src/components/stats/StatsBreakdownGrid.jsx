import StatTable from './StatTable'

function StatsBreakdownGrid({ stats, t }) {
  return (
    <>
      <StatTable
        columns={[
          { key: 'category', label: t('resources.fields.category') },
          { key: 'total_cents', label: t('stats.columns.total'), type: 'money' },
          { key: 'percentage', label: t('stats.columns.percentage'), type: 'percent' },
        ]}
        rows={stats.categoryRows}
        title={t('stats.expenseDistribution.title')}
        t={t}
      />
      <StatTable
        columns={[
          { key: 'account', label: t('resources.fields.bankAccount') },
          { key: 'amount_cents', label: t('resources.fields.amount'), type: 'money' },
        ]}
        rows={stats.accountRows}
        title={t('stats.bankAccounts.title')}
        t={t}
      />
      <StatTable
        columns={[
          { key: 'account_type', label: t('resources.fields.accountType') },
          { key: 'amount_cents', label: t('resources.fields.amount'), type: 'money' },
        ]}
        rows={stats.accountTypeRows}
        title={t('stats.treasurySavings.title')}
        t={t}
      />
    </>
  )
}

export default StatsBreakdownGrid
