import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import StatsPage from '../pages/StatsPage'
import CategoriesPage from '../pages/CategoriesPage'
import ExpensesPage from '../pages/ExpensesPage'
import RecurringExpensesPage from '../pages/RecurringExpensesPage'
import IncomesPage from '../pages/IncomesPage'
import RecurringIncomesPage from '../pages/RecurringIncomesPage'
import BankAccountsPage from '../pages/BankAccountsPage'
import AccountTypesPage from '../pages/AccountTypesPage'
import NotFoundPage from '../pages/NotFoundPage'
import RouterErrorPage from '../pages/RouterErrorPage'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <RouterErrorPage />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <AppLayout />,
    errorElement: <RouterErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/stats',
        element: <StatsPage />,
      },
      {
        path: '/resource/categories',
        element: <CategoriesPage />,
      },
      {
        path: '/resource/expenses',
        element: <ExpensesPage />,
      },
      {
        path: '/resource/recurring-expenses',
        element: <RecurringExpensesPage />,
      },
      {
        path: '/resource/incomes',
        element: <IncomesPage />,
      },
      {
        path: '/resource/recurring-incomes',
        element: <RecurringIncomesPage />,
      },
      {
        path: '/resource/bank-accounts',
        element: <BankAccountsPage />,
      },
      {
        path: '/resource/account-types',
        element: <AccountTypesPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
