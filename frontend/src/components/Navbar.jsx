import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setShowNotifs(false)
  }, [location.pathname])

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/users/notifications')
      setNotifications(data)
    } catch (err) {}
  }

  const markRead = async (id) => {
    try {
      await api.put(`/users/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
    } catch (err) {}
  }

  const markAllRead = async () => {
    try {
      await api.put('/users/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {}
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatNotificationMessage = (message) => {
    // Replace ISO dates with formatted dates
    return message.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, (match) => {
      const date = new Date(match);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });
  }

  const getNavLinks = () => {
    if (!user) return []
    switch (user.role) {
      case 'user':
        return [
          { to: '/dashboard',         label: 'Dashboard',       icon: 'dashboard' },
          { to: '/doctors',           label: 'Find Doctors',    icon: 'search' },
          { to: '/my-appointments',   label: 'Appointments',    icon: 'calendar_month' },
          { to: '/prescriptions',     label: 'Prescriptions',   icon: 'medication' },
        ]
      case 'doctor':
        return [
          { to: '/doctor',              label: 'Dashboard',    icon: 'dashboard' },
          { to: '/doctor/appointments', label: 'Appointments', icon: 'calendar_month' },
          { to: '/doctor/slots',        label: 'My Slots',     icon: 'schedule' },
          { to: '/doctor/profile',      label: 'Profile',      icon: 'person' },
        ]
      case 'admin':
        return [
          { to: '/admin',              label: 'Dashboard',    icon: 'dashboard' },
          { to: '/admin/doctors',      label: 'Doctors',      icon: 'medical_services' },
          { to: '/admin/users',        label: 'Users',        icon: 'people' },
          { to: '/admin/appointments', label: 'Appointments', icon: 'calendar_month' },
          { to: '/admin/settings',     label: 'Settings',     icon: 'settings' },
        ]
      default:
        return []
    }
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markRead(notif._id)
    }
    setShowNotifs(false)

    const role = user?.role
    const message = notif.message?.toLowerCase() || ''

    if (message.includes('prescription')) {
      if (role === 'user') {
        navigate('/prescriptions', { state: { highlightAppointmentId: notif.relatedAppointment || notif.appointment } })
      } else if (role === 'doctor') {
        navigate('/doctor/appointments', { state: { highlightAppointmentId: notif.relatedAppointment || notif.appointment } })
      }
    } else if ((notif.type === 'booking' || notif.type === 'general') && (notif.relatedAppointment || notif.appointment)) {
      if (role === 'user') {
        navigate('/my-appointments', { state: { highlightAppointmentId: notif.relatedAppointment || notif.appointment } })
      } else if (role === 'doctor') {
        navigate('/doctor/appointments', { state: { highlightAppointmentId: notif.relatedAppointment || notif.appointment } })
      } else if (role === 'admin') {
        navigate('/admin/appointments', { state: { highlightAppointmentId: notif.relatedAppointment || notif.appointment } })
      }
    } else if (notif.type === 'doctor_approval') {
      if (role === 'admin') {
        navigate('/admin/doctors')
      }
    } else if (notif.type === 'account') {
      navigate('/dashboard')
    }
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case 'reminder': return 'schedule'
      case 'booking': return 'event'
      case 'completion': return 'check_circle'
      case 'approval': return 'celebration'
      default: return 'notifications'
    }
  }

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (!isAuthenticated) {
    return (
      <nav className="bg-surface-container-lowest border-b border-outline-variant/10 sticky top-0 z-50">
        <div className="px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
              <span className="material-symbols-outlined">medical_services</span>
              DocBook
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-on-surface-variant hover:text-primary font-medium text-sm">
                Login
              </Link>
              <Link to="/register" className="bg-primary text-on-primary px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary-container transition-all">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 bg-surface-container-lowest border-r border-outline-variant/10 flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-outline-variant/10">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <span className="material-symbols-outlined text-2xl">medical_services</span>
            DocBook
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {getNavLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-primary text-on-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {location.pathname === link.to ? 'check_circle' : link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-outline-variant/10">
          <div className="bg-surface-container-low rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-on-surface truncate">{user?.name}</p>
                <p className="text-xs text-on-surface-variant capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-error hover:bg-error-container hover:text-on-error-container rounded-xl transition-all font-medium text-sm"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/10 z-50 px-2 pb-6 pt-2">
        <div className="flex items-center justify-around h-16">
          <button
            onClick={() => setShowNotifs(true)}
            className="flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 rounded-xl transition-all duration-200 relative"
          >
            <span className="material-symbols-outlined text-2xl text-on-surface-variant">notifications</span>
            <span className="text-[10px] font-medium text-on-surface-variant">Alerts</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 bg-error rounded-full text-on-error text-[10px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {getNavLinks().map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 rounded-xl transition-all duration-200 ${
                location.pathname === link.to
                  ? 'text-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {link.icon}
              </span>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Notification Modal */}
      {showNotifs && (
        <div className="md:hidden fixed inset-0 bg-black/50 flex items-end z-50 animate-fade-in">
          <div className="bg-surface-container-lowest w-full rounded-t-3xl max-h-[80vh] overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
              <h3 className="font-bold text-lg text-on-surface">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-sm text-primary font-medium">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setShowNotifs(false)} className="p-2 hover:bg-surface-container-low rounded-xl">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-2">notifications</span>
                  <p className="text-on-surface-variant">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 20).map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 rounded-xl mb-2 cursor-pointer transition-colors ${
                      !notif.isRead ? 'bg-primary-fixed' : 'bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-2xl text-primary">
                        {getNotifIcon(notif.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-on-surface ${!notif.isRead ? 'font-bold' : ''}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                          {formatNotificationMessage(notif.message)}
                        </p>
                        <p className="text-xs text-on-surface-variant/60 mt-2">{timeAgo(notif.createdAt)}</p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden md:flex fixed top-0 left-72 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/10 items-center justify-end px-6 z-40">
        <div ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2.5 bg-surface-container-low rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full text-on-error text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 mt-2 w-96 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/10 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
              <h3 className="font-bold text-lg text-on-surface">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-sm text-primary font-medium">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-2">notifications</span>
                  <p className="text-on-surface-variant">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 20).map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b border-outline-variant/10 last:border-0 cursor-pointer hover:bg-surface-container-low transition-colors ${
                      !notif.isRead ? 'bg-primary-fixed' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-2xl text-primary">
                        {getNotifIcon(notif.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-on-surface ${!notif.isRead ? 'font-bold' : ''}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                          {formatNotificationMessage(notif.message)}
                        </p>
                        <p className="text-xs text-on-surface-variant/60 mt-2">{timeAgo(notif.createdAt)}</p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  )
}

export default Navbar
