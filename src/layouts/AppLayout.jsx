import { Navigate, Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SessionLoader from '../components/SessionLoader'
import { useAppContext } from '../context/AppContext'

function AppLayout() {
  const { authChecked, authUser } = useAppContext()

  if (!authChecked) {
    return <SessionLoader />
  }

  if (!authUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout
