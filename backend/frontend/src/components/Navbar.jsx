import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { User, Stethoscope, Shield, LogOut, Bell, Calendar, Users, Settings, LayoutDashboard, Search } from 'lucide-react'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getNavLinks = () => {
    if (!user) return []
    
    switch (user.role) {
      case 'user':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/doctors', label: 'Find Doctors', icon: Search },
          { to: '/my-appointments', label: 'My Appointments', icon: Calendar },
        ]
      case 'doctor':
        return [
          { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
          { to: '/doctor/profile', label: 'Profile', icon: User },
        ]
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
          { to: '/admin/users', label: 'Users', icon: Users },
          { to: '/admin/settings', label: 'Settings', icon: Settings },
        ]
      default:
        return []
    }
  }

  const RoleIcon = () => {
    if (!user) return null
    if (user.role === 'doctor') return <Stethoscope className="w-4 h-4" />
    if (user.role === 'admin') return <Shield className="w-4 h-4" />
    return <User className="w-4 h-4" />
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <Stethoscope className="w-6 h-6" />
            DocBook
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-1">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              ))}
            </div>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 pl-3 border-l">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                  <RoleIcon />
                </div>
                <div className="hidden md:block text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
