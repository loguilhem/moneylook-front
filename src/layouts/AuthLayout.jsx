import { Navigate, Outlet } from 'react-router-dom'
import SessionLoader from '../components/SessionLoader'
import { useAppContext } from '../context/AppContext'

function AuthLayout() {
  const { authChecked, authUser } = useAppContext()

  if (!authChecked) {
    return <SessionLoader />
  }

  if (authUser) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default AuthLayout
