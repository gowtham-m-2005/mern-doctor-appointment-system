import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import StatCard from '../../components/StatCard'
import EmptyState from '../../components/EmptyState'
import LoadingSkeleton from '../../components/LoadingSkeleton'

const DoctorDashboard = () => {
  const { doctor, user } = useAuthStore()
  const [stats, setStats] = useState({ total: 0, today: 0, completed: 0, todayCompleted: 0, totalEarnings: 0, pendingEarnings: 0, growthPercent: 0 })
  const [todayAppointments, setTodayAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, apptsRes] = await Promise.all([
        api.get('/doctor/dashboard'),
        api.get('/doctor/appointments'),
      ])
      setStats(statsRes.data)

      const today = new Date().toISOString().split('T')[0]
      const todayAppts = apptsRes.data.filter((a) => {
        const slotDate = new Date(a.slot.date).toISOString().split('T')[0]
        return slotDate === today && (a.status === 'confirmed' || a.status === 'pending')
      })
      setTodayAppointments(todayAppts.slice(0, 5))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (doctor?.isApproved === 'pending') {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-3xl text-center animate-scale-in">
        <span className="material-symbols-outlined text-6xl text-yellow-600 mb-4">pending</span>
        <h2 className="text-xl font-bold mb-2 text-on-surface">Account Pending Approval</h2>
        <p className="text-on-surface-variant">Your doctor account is under review. You'll be notified once approved.</p>
      </div>
    )
  }

  if (doctor?.isApproved === 'rejected') {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-3xl text-center animate-scale-in">
        <span className="material-symbols-outlined text-6xl text-error mb-4">cancel</span>
        <h2 className="text-xl font-bold mb-2 text-on-surface">Account Rejected</h2>
        <p className="text-on-surface-variant">Your application was not approved. Please contact support.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-10">
      {/* Mobile Header */}
      <div className="animate-fade-in-down md:hidden">
        <div>
          <h1 className="text-2xl font-extrabold font-headline text-on-surface tracking-tight">
            Good morning, <span className="text-primary">{user?.name}</span>
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium text-sm">{stats.today} appointments today</p>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-fade-in-down">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface tracking-tight">
            Good morning, <span className="text-primary">{user?.name}</span>
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium">You have <span className="text-on-surface font-bold">{stats.today} appointments</span> scheduled for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-surface-container-lowest px-4 py-2.5 rounded-xl border style={{boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}} flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-sm font-semibold text-on-surface">Next: {todayAppointments[0]?.user?.name || 'No upcoming'}</p>
          </div>
        </div>
      </div>

      {/* Mobile Stats - Horizontal Scroll */}
      <section className="md:hidden overflow-x-auto pb-2 animate-fade-in-up -mx-5 px-5">
        <div className="flex gap-4 pr-6">
          <div className="bg-surface-container-lowest p-4 rounded-2xl border shadow-md min-w-[140px]">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">calendar_month</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.total}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Total Visits</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border shadow-md min-w-[140px]">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">group</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.today}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Today's Patients</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border shadow-md min-w-[140px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">task_alt</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.completed}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Completed Today</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border shadow-md min-w-[140px]">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">₹{stats.totalEarnings}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Total Earnings</p>
          </div>
        </div>
      </section>

      {/* Desktop Stats Grid */}
      <section className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="calendar_month"
          value={stats.total}
          label="Total Visits"
          description="from last month"
          badge={`${stats.growthPercent >= 0 ? '+' : ''}${stats.growthPercent}%`}
          variant="default"
        />
        <div className="bg-surface-container-lowest p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-surface-container-lowest flex items-center justify-center text-[8px] font-bold text-on-surface-variant">+{stats.todayPending || 0}</div>
            </div>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Today's Patients</p>
          <h3 className="text-3xl font-extrabold font-headline mt-1 text-on-surface">{stats.today}</h3>
          <p className="text-[11px] text-on-surface-variant mt-2">{stats.todayPending || 0} consultations left</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-lg">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% Done</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Total Completed</p>
          <h3 className="text-3xl font-extrabold font-headline mt-1 text-on-surface">{stats.completed} <span className="text-on-surface-variant font-light">/ {stats.total}</span></h3>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`, transition: 'width 1s ease-in-out' }}></div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <Link to="/doctor/appointments" className="p-1.5 hover:bg-surface-container-low rounded-lg"><span className="material-symbols-outlined text-on-surface-variant text-lg">arrow_outward</span></Link>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Total Earnings</p>
          <h3 className="text-3xl font-extrabold font-headline mt-1 text-on-surface">₹{stats.totalEarnings}</h3>
          <p className="text-[11px] text-indigo-600 font-bold mt-2">₹{stats.pendingEarnings} pending</p>
        </div>
      </section>

      {/* Main Content - Mobile Schedule */}
      <div className="md:hidden animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold font-headline text-on-surface">Today's Schedule</h2>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          </div>
          <Link to="/doctor/appointments" className="text-primary text-xs font-bold">View All</Link>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl border style={{boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}} shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-center py-8 text-on-surface-variant">Loading...</p>
          ) : todayAppointments.length === 0 ? (
            <EmptyState icon="event_busy" message="No appointments today" size="small" />
          ) : (
            <div className="divide-y divide-surface-container">
              {todayAppointments.map((appt, index) => (
                <div key={appt._id} className="p-4 flex items-center gap-4 hover:bg-surface-container-high/50 transition-colors relative overflow-hidden" style={{transition: 'background-color 0.2s'}}>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                  <div className="w-14 text-center flex-shrink-0">
                    <p className="text-base font-black font-headline text-primary leading-none">{appt.slot?.startTime?.substring(0, 5) || '09:00'}</p>
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase mt-1">{appt.slot?.startTime?.substring(0, 2) >= 12 ? 'PM' : 'AM'}</p>
                  </div>
                  <div className="flex-grow flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {appt.user?.name?.charAt(0) || 'P'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-on-surface truncate">{appt.user?.name}</h4>
                      <p className="text-xs text-on-surface-variant truncate">{doctor?.specialization || 'General'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[9px] font-bold rounded-full uppercase flex-shrink-0">Confirmed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Split - Desktop */}
      <div className="hidden md:grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        {/* Schedule Section */}
        <div className="xl:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold font-headline text-on-surface">Today's Schedule</h2>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex gap-2">
              <Link to="/doctor/appointments" className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-all">View Full Calendar</Link>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-[2rem] border shadow-sm overflow-hidden" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
            {loading ? (
              <p className="text-center py-8 text-on-surface-variant">Loading...</p>
            ) : todayAppointments.length === 0 ? (
              <EmptyState icon="event_busy" message="No appointments today" />
            ) : (
              <div className="divide-y divide-surface-container">
                {todayAppointments.map((appt, index) => (
                  <div key={appt._id} className="p-5 flex items-center gap-6 hover:bg-surface-container-high/50 transition-colors relative overflow-hidden group" style={{transition: 'background-color 0.2s'}}>
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                    <div className="w-16 text-center">
                      <p className="text-lg font-black font-headline text-primary leading-none">{appt.slot?.startTime?.substring(0, 5) || '09:00'}</p>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase mt-1">AM</p>
                    </div>
                    <div className="flex-grow flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm">
                        {appt.user?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-base font-bold text-on-surface">{appt.user?.name}</h4>
                          <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[9px] font-bold rounded-full uppercase">Confirmed</span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium">Consultation • {doctor?.specialization || 'General'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Quick Actions Card */}
        <div className="xl:col-span-4">
          <div className="bg-surface-container-low rounded-3xl p-8 border style={{boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}} shadow-sm flex flex-col h-full min-h-[400px]">
            <div>
              <h3 className="text-2xl font-extrabold text-on-surface mb-2">Quick Actions</h3>
              <p className="text-on-surface-variant text-sm mb-6">Manage your practice efficiently</p>
              <div className="space-y-4">
                <Link to="/doctor/profile" className="block bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-primary/5 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">add_circle</span>
                    </div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">Slots</span>
                  </div>
                  <h4 className="font-bold text-on-surface">Manage Availability</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Add or remove time slots</p>
                </Link>
                <Link to="/doctor/appointments" className="block bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-primary/5 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant">
                      <span className="material-symbols-outlined">calendar_month</span>
                    </div>
                    <span className="text-xs font-bold text-on-secondary-fixed-variant uppercase tracking-wide">Schedule</span>
                  </div>
                  <h4 className="font-bold text-on-surface">View Appointments</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Manage patient consultations</p>
                </Link>
                <Link to="/doctor/profile" className="block bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-primary/5 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <span className="text-xs font-bold text-on-tertiary-fixed-variant uppercase tracking-wide">Profile</span>
                  </div>
                  <h4 className="font-bold text-on-surface">Update Profile</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Edit your professional details</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
