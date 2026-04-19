import { resourceByKey } from './resources'

export const HOME_PAGE = 'home'

const resourceRoutes = {
  accountTypes: 'account-types',
  bankAccounts: 'bank-accounts',
  categories: 'categories',
  expenses: 'expenses',
  incomes: 'incomes',
  recurringExpenses: 'recurring-expenses',
  recurringIncomes: 'recurring-incomes',
}

export function pageFromPath(pathname) {
  const cleanPath = pathname.replace(/\/+$/, '') || '/'

  if (cleanPath === '/') {
    return HOME_PAGE
  }

  if (!cleanPath.startsWith('/app/')) {
    return HOME_PAGE
  }

  const pageKey = decodeURIComponent(cleanPath.slice('/app/'.length))
  if (pageKey === 'stats' || resourceByKey[pageKey]) {
    return pageKey
  }

  return HOME_PAGE
}

export function pathFromPage(pageKey) {
  if (pageKey === HOME_PAGE) {
    return '/'
  }

  if (pageKey === 'stats') {
    return '/stats'
  }

  if (resourceByKey[pageKey]) {
    return `/resource/${resourceRoutes[pageKey] ?? pageKey}`
  }

  return `/${encodeURIComponent(pageKey)}`
}
