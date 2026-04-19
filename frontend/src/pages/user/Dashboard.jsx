import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import { Settings } from 'lucide-react'
import StatusBadge from '../../components/StatusBadge'
import StatCard from '../../components/StatCard'
import EmptyState from '../../components/EmptyState'
import LoadingSkeleton from '../../components/LoadingSkeleton'

const UserDashboard = () => {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/users/appointments')
      setAppointments(data.slice(0, 5))
      const today = new Date().toISOString().split('T')[0]
      setStats({
        total: data.length,
        upcoming: data.filter((a) => a.status === 'confirmed' && a.slot.date >= today).length,
        completed: data.filter((a) => a.status === 'completed').length,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-10 max-w-7xl mx-auto">
      {/* Mobile Header */}
      <div className="md:hidden animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-extrabold font-headline text-on-surface tracking-tight">
            Welcome, <span className="text-primary">{user?.name?.split(' ')[0] || user?.name}</span>
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">Manage your health</p>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-fade-in-down">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface tracking-tight">
            Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || user?.name}</span>
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium">Manage your health and appointments</p>
        </div>
        <div className="flex gap-2">
          <Link to="/user/settings" className="btn-secondary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <Link to="/doctors" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary-container shadow-md shadow-primary/10 transition-all active:scale-95">
            <span className="material-symbols-outlined text-xl">add</span>
            Book Appointment
          </Link>
        </div>
      </div>

      {/* Mobile Stats - Horizontal Scroll */}
      <section className="md:hidden overflow-x-auto pb-2 animate-fade-in-up">
        <div className="flex gap-3 min-w-max">
          <div className="bg-surface-container-lowest p-4 rounded-2xl border flex-shrink-0" style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
            <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">calendar_month</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.total}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Total</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border flex-shrink-0" style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">schedule</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.upcoming}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Upcoming</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border flex-shrink-0" style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.completed}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Completed</p>
          </div>
        </div>
      </section>

      {/* Desktop Stats Grid */}
      <section className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon="calendar_month"
          value={stats.total}
          label="Total Appointments"
          description="Your booking history"
          badge="All Time"
          variant="default"
        />
        <div className="bg-surface-container-lowest p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Upcoming</p>
          <h3 className="text-3xl font-extrabold font-headline mt-1 text-on-surface">{stats.upcoming}</h3>
          <p className="text-[11px] text-on-surface-variant mt-2">Scheduled visits</p>
        </div>
        <StatCard
          icon="check_circle"
          value={stats.completed}
          label="Completed"
          description="Past consultations"
          badge="History"
          variant="emerald"
        />
      </section>

      {/* Mobile Recent Appointments */}
      <div className="md:hidden animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold font-headline text-on-surface">Recent Appointments</h2>
          <Link to="/my-appointments" className="text-primary text-xs font-bold">View All</Link>
        </div>
        {loading ? (
          <LoadingSkeleton count={3} height="h-20" className="rounded-2xl" />
        ) : appointments.length === 0 ? (
          <EmptyState icon="event_busy" message="No appointments yet" />
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div key={appt._id} className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
                <div className="w-14 h-14 rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-primary border border-primary/5 flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(appt.slot.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-xl font-black">{new Date(appt.slot.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-on-surface truncate">{appt.doctor?.user?.name || 'Unknown'}</h3>
                  <p className="text-xs text-on-surface-variant">{appt.doctor?.specialization}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-on-surface-variant">₹{appt.totalFee}</p>
                  <StatusBadge status={appt.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Recent Appointments */}
      <div className="hidden md:block bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,82,174,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold font-headline text-on-surface">Recent Appointments</h2>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Your latest bookings</p>
          </div>
          <Link to="/my-appointments" className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center gap-1">
            View All
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} height="h-32" className="rounded-2xl" />
        ) : appointments.length === 0 ? (
          <EmptyState 
            icon="event_busy" 
            message="No appointments yet" 
            actionText="Book Your First Appointment"
            actionLink="/doctors"
            size="default"
          />
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div key={appt._id} className="bg-surface-container-low p-6 rounded-2xl flex items-center gap-6 hover:bg-surface-container-highest transition-all" style={{transition: 'background-color 0.2s'}}>
                <div className="w-20 h-20 rounded-2xl bg-surface-container-lowest flex flex-col items-center justify-center text-primary border border-primary/5">
                  <span className="text-xs font-bold uppercase tracking-widest">{new Date(appt.slot.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-2xl font-black">{new Date(appt.slot.date).getDate()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">{appt.doctor?.user?.name || 'Unknown'}</h3>
                      <p className="text-primary text-sm font-semibold">{appt.doctor?.specialization}</p>
                      <p className="text-on-surface-variant text-sm mt-1">{appt.slot.startTime} - {appt.slot.endTime}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-on-surface-variant">Total Paid</p>
                  <p className="text-xl font-bold text-on-surface">₹{appt.totalFee}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDashboard
