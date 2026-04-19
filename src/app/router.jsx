import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import StatsPage from '../pages/StatsPage'
import ResourcePage from '../pages/ResourcePage'
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
        path: '/resource/:resourceKey',
        element: <ResourcePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])