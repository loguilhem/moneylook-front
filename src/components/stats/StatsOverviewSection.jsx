import StatCard from './StatCard'
import { formatMoney } from './statsFormatters'

function StatsOverviewSection({ stats, t }) {
  return (
    <section className="stats-section" aria-labelledby="global-heading">
      <div className="section-heading">
        <h2 id="global-heading">{t('stats.global.title')}</h2>
        <p>{t('stats.global.description')}</p>
      </div>
      <div className="stats-summary">
        <StatCard label={t('stats.cards.totalIncome')} value={formatMoney(stats.totalIncomeCents)} />
        <StatCard label={t('stats.cards.totalExpense')} value={formatMoney(stats.totalExpenseCents)} />
        <StatCard
          label={t('stats.cards.netBalance')}
          tone={stats.netBalanceCents >= 0 ? 'positive' : 'negative'}
          value={formatMoney(stats.netBalanceCents)}
        />
      </div>
      <div className="section-heading treasury-heading">
        <h2>{t('stats.currentAccounts.title')}</h2>
        <p>{t('stats.currentAccounts.description')}</p>
      </div>
      <div className="stats-summary">
        <StatCard
          label={t('stats.cards.currentIncome')}
          value={formatMoney(stats.currentAccountSummary.income_cents, stats.currentAccountSummary.currency)}
        />
        <StatCard
          label={t('stats.cards.currentExpense')}
          value={formatMoney(stats.currentAccountSummary.expense_cents, stats.currentAccountSummary.currency)}
        />
        <StatCard
          label={t('stats.cards.currentBalance')}
          tone={stats.currentAccountSummary.balance_cents >= 0 ? 'positive' : 'negative'}
          value={formatMoney(stats.currentAccountSummary.balance_cents, stats.currentAccountSummary.currency)}
        />
      </div>
    </section>
  )
}

export default StatsOverviewSection
