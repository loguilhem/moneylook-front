export const DEFAULT_MONTH_LABELS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

function toDateInput(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getDefaultRange() {
  const now = new Date()

  return {
    endDate: toDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    startDate: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
  }
}

function isInRange(item, startDate, endDate) {
  return item.date >= startDate && item.date <= endDate
}

function amount(item) {
  return Number(item.amount_cents ?? 0)
}

function sum(items) {
  return items.reduce((total, item) => total + amount(item), 0)
}

function itemLabel(item) {
  return item?.label ?? item?.name ?? `#${item?.id}`
}

function getCurrencyFromRows(rows) {
  const currencies = [...new Set(rows.map((row) => row.currency).filter(Boolean))]

  return currencies.length === 1 ? currencies[0] : 'CHF'
}

export function buildYears(expenses, incomes) {
  const currentYear = new Date().getFullYear()
  const years = new Set([currentYear])

  expenses.forEach((expense) => years.add(new Date(expense.date).getFullYear()))
  incomes.forEach((income) => years.add(new Date(income.date).getFullYear()))

  return [...years].filter(Number.isFinite).sort((a, b) => b - a)
}

export function buildStatsData({
  accountTypes,
  allExpenses,
  allIncomes,
  bankAccounts,
  categories,
  endDate,
  monthColumnLabel,
  monthLabels,
  selectedYear,
  startDate,
}) {
  const expenses = allExpenses.filter((expense) => isInRange(expense, startDate, endDate))
  const incomes = allIncomes.filter((income) => isInRange(income, startDate, endDate))
  const totalExpenseCents = sum(expenses)
  const totalIncomeCents = sum(incomes)
  const categoryRows = buildExpenseCategoryRows(expenses, categories, totalExpenseCents)
  const accountRows = buildAccountRows(expenses, incomes, bankAccounts)
  const accountTypeRows = buildAccountTypeRows(accountRows, accountTypes)
  const currentAccountSummary = buildCurrentAccountSummary(expenses, incomes, bankAccounts, accountTypes)
  const annualRows = buildAnnualRows(allExpenses, allIncomes, selectedYear, monthLabels)
  const monthlyAccountRows = buildMonthlyAccountRows(allExpenses, allIncomes, bankAccounts, selectedYear, monthLabels)
  const monthlyAccountColumns = buildMonthlyAccountColumns(bankAccounts, monthColumnLabel)

  return {
    accountRows,
    accountTypeRows,
    annualRows,
    categoryRows,
    currentAccountSummary,
    monthlyAccountColumns,
    monthlyAccountRows,
    totalExpenseCents,
    totalIncomeCents,
    netBalanceCents: totalIncomeCents - totalExpenseCents,
  }
}

function buildExpenseCategoryRows(expenses, categories, totalExpenseCents) {
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const totals = new Map()

  expenses.forEach((expense) => {
    totals.set(expense.category_id, (totals.get(expense.category_id) ?? 0) + amount(expense))
  })

  return [...totals.entries()]
    .map(([categoryId, totalCents]) => {
      const category = categoryById.get(categoryId)

      return {
        category,
        percentage: totalExpenseCents > 0 ? (totalCents / totalExpenseCents) * 100 : 0,
        total_cents: totalCents,
      }
    })
    .sort((a, b) => b.total_cents - a.total_cents)
}

function buildAccountRows(expenses, incomes, bankAccounts) {
  return bankAccounts
    .map((account) => {
      const accountExpenses = expenses.filter((expense) => expense.bank_account_id === account.id)
      const accountIncomes = incomes.filter((income) => income.bank_account_id === account.id)
      const initialBalanceCents = Number(account.initial_balance_cents ?? 0)

      return {
        account: itemLabel(account),
        account_type_id: account.account_type_id,
        amount_cents: initialBalanceCents + sum(accountIncomes) - sum(accountExpenses),
        currency: account.currency,
      }
    })
    .filter((row) => row.amount_cents !== 0)
    .sort((a, b) => b.amount_cents - a.amount_cents)
}

function buildAccountTypeRows(accountRows, accountTypes) {
  const accountTypeById = new Map(accountTypes.map((accountType) => [accountType.id, accountType]))
  const rowsByType = new Map()

  accountRows.forEach((accountRow) => {
    const current = rowsByType.get(accountRow.account_type_id) ?? {
      account_type: itemLabel(accountTypeById.get(accountRow.account_type_id)),
      amount_cents: 0,
      currencies: [],
    }
    current.amount_cents += accountRow.amount_cents
    current.currencies.push(accountRow.currency)
    rowsByType.set(accountRow.account_type_id, current)
  })

  return [...rowsByType.values()]
    .map((row) => ({
      account_type: row.account_type,
      amount_cents: row.amount_cents,
      currency: getCurrencyFromRows(row.currencies.map((currency) => ({ currency }))),
    }))
    .sort((a, b) => b.amount_cents - a.amount_cents)
}

function isCurrentAccountType(accountType) {
  return accountType?.code === 'current'
}

function buildCurrentAccountSummary(expenses, incomes, bankAccounts, accountTypes) {
  const accountTypeById = new Map(accountTypes.map((accountType) => [accountType.id, accountType]))
  const currentAccounts = bankAccounts.filter((account) => isCurrentAccountType(accountTypeById.get(account.account_type_id)))
  const currentAccountIds = new Set(currentAccounts.map((account) => account.id))
  const currentExpenses = expenses.filter((expense) => currentAccountIds.has(expense.bank_account_id))
  const currentIncomes = incomes.filter((income) => currentAccountIds.has(income.bank_account_id))
  const incomeCents = sum(currentIncomes)
  const expenseCents = sum(currentExpenses)

  return {
    balance_cents: incomeCents - expenseCents,
    currency: getCurrencyFromRows(currentAccounts),
    expense_cents: expenseCents,
    income_cents: incomeCents,
  }
}

function buildAnnualRows(expenses, incomes, selectedYear, monthLabels) {
  return monthLabels.map((month, monthIndex) => {
    const monthKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`

    return {
      expense_cents: sum(expenses.filter((expense) => expense.date.startsWith(monthKey))),
      income_cents: sum(incomes.filter((income) => income.date.startsWith(monthKey))),
      month,
    }
  })
}

function buildMonthlyAccountColumns(bankAccounts, monthColumnLabel) {
  return [
    { key: 'month', label: monthColumnLabel },
    ...bankAccounts.map((account) => ({
      key: `account_${account.id}`,
      label: itemLabel(account),
      type: 'money',
      currency: account.currency,
    })),
  ]
}

function buildMonthlyAccountRows(expenses, incomes, bankAccounts, selectedYear, monthLabels) {
  return monthLabels.map((month, monthIndex) => {
    const monthEndDate = toDateInput(new Date(selectedYear, monthIndex + 1, 0))
    const row = { month }

    bankAccounts.forEach((account) => {
      const monthlyExpenses = expenses.filter(
        (expense) => expense.bank_account_id === account.id && expense.date <= monthEndDate,
      )
      const monthlyIncomes = incomes.filter(
        (income) => income.bank_account_id === account.id && income.date <= monthEndDate,
      )

      row[`account_${account.id}`] = Number(account.initial_balance_cents ?? 0) + sum(monthlyIncomes) - sum(monthlyExpenses)
    })

    return row
  })
}
