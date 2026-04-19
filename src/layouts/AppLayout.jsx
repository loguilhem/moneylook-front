import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import GuidedTour, { TOUR_COMPLETED_KEY } from '../components/GuidedTour'
import SessionLoader from '../components/SessionLoader'
import { useAppContext } from '../context/AppContext'

function AppLayout() {
  const { authChecked, authUser } = useAppContext()
  const [isTourOpen, setIsTourOpen] = useState(false)

  useEffect(() => {
    if (!authUser || localStorage.getItem(TOUR_COMPLETED_KEY)) {
      return
    }

    const timeoutId = window.setTimeout(() => setIsTourOpen(true), 400)
    return () => window.clearTimeout(timeoutId)
  }, [authUser])

  function openTour() {
    setIsTourOpen(true)
  }

  function closeTour() {
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true')
    setIsTourOpen(false)
  }

  if (!authChecked) {
    return <SessionLoader />
  }

  if (!authUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-shell">
      <Navbar onStartTour={openTour} />
      <main className="app-content" data-tour="app-content">
        <Outlet />
      </main>
      {isTourOpen ? <GuidedTour onClose={closeTour} /> : null}
      <Footer />
    </div>
  )
}

export default AppLayout
