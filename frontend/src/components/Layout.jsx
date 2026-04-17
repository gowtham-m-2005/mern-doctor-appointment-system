import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import { useEffect, useState } from 'react'

const Layout = () => {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('fadeIn')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut')
      setTimeout(() => {
        setDisplayLocation(location)
        setTransitionStage('fadeIn')
      }, 150)
    }
  }, [location, displayLocation])

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <Navbar />
      <main className="mt-4 md:ml-72 md:mt-16 pb-24 md:pb-6">
        <div className="px-5 md:px-6">
          <div
            className={`transition-all duration-300 ease-out ${
              transitionStage === 'fadeIn'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <Outlet context={{ location: displayLocation }} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout
