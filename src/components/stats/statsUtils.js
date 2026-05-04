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
  const { categoryDetailsByParent, categoryRows } = buildExpenseCategoryStats(expenses, categories, totalExpenseCents)
  const accountRows = buildAccountRows(expenses, incomes, bankAccounts)
  const accountTypeRows = buildAccountTypeRows(accountRows, accountTypes)
  const currentAccountSummary = buildCurrentAccountSummary(expenses, incomes, bankAccounts, accountTypes)
  const annualRows = buildAnnualRows(allExpenses, allIncomes, selectedYear, monthLabels)
  const monthlyAccountRows = buildMonthlyAccountRows(allExpenses, allIncomes, bankAccounts, selectedYear, monthLabels)
  const monthlyAccountColumns = buildMonthlyAccountColumns(bankAccounts, monthColumnLabel)

  return {
    accountRows,
    accountTypeRows,
    categoryDetailsByParent,
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

function buildExpenseCategoryStats(expenses, categories, totalExpenseCents) {
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const totals = new Map()
  const childTotalsByParent = new Map()
  const expensesByParent = new Map()

  expenses.forEach((expense) => {
    const parentCategory = getParentCategory(categoryById, expense.category_id)
    const categoryId = parentCategory?.id ?? expense.category_id
    const expenseCategory = categoryById.get(expense.category_id)

    totals.set(categoryId, (totals.get(categoryId) ?? 0) + amount(expense))

    if (parentCategory?.id && expenseCategory?.parent) {
      const childTotals = childTotalsByParent.get(parentCategory.id) ?? new Map()
      childTotals.set(expenseCategory.id, (childTotals.get(expenseCategory.id) ?? 0) + amount(expense))
      childTotalsByParent.set(parentCategory.id, childTotals)

      const parentExpenses = expensesByParent.get(parentCategory.id) ?? []
      parentExpenses.push({
        ...expense,
        category: expenseCategory,
      })
      expensesByParent.set(parentCategory.id, parentExpenses)
    }
  })

  const categoryRows = [...totals.entries()]
    .map(([categoryId, totalCents]) => ({
      category: categoryById.get(categoryId),
      percentage: totalExpenseCents > 0 ? (totalCents / totalExpenseCents) * 100 : 0,
      total_cents: totalCents,
    }))
    .sort((a, b) => b.total_cents - a.total_cents)

  const categoryDetailsByParent = Object.fromEntries(
    [...childTotalsByParent.entries()].map(([parentCategoryId, childTotals]) => {
      const parentExpenseRows = expensesByParent.get(parentCategoryId) ?? []
      const parentChildrenTotalCents = sum(parentExpenseRows)

      return [
        parentCategoryId,
        {
          childRows: [...childTotals.entries()]
            .map(([categoryId, totalCents]) => ({
              category: categoryById.get(categoryId),
              percentage: parentChildrenTotalCents > 0 ? (totalCents / parentChildrenTotalCents) * 100 : 0,
              total_cents: totalCents,
            }))
            .sort((a, b) => b.total_cents - a.total_cents),
          expenseRows: parentExpenseRows.sort((a, b) => b.date.localeCompare(a.date)),
          total_cents: parentChildrenTotalCents,
        },
      ]
    }),
  )

  return { categoryDetailsByParent, categoryRows }
}

function getParentCategory(categoryById, categoryId) {
  let category = categoryById.get(categoryId)
  const visitedCategoryIds = new Set()

  while (category?.parent) {
    if (visitedCategoryIds.has(category.id)) {
      return category
    }

    visitedCategoryIds.add(category.id)
    category = categoryById.get(category.parent) ?? category
  }

  return category
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
