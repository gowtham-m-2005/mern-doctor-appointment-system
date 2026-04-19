import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import StatCard from '../../components/StatCard'
import EmptyState from '../../components/EmptyState'
import LoadingSkeleton from '../../components/LoadingSkeleton'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, apptsRes] = await Promise.all([api.get('/admin/dashboard'), api.get('/admin/appointments')])
      setStats(statsRes.data)
      // Handle both array (old) and paginated (new) responses
      const appointments = Array.isArray(apptsRes.data) ? apptsRes.data : (apptsRes.data.appointments || [])
      // Show only confirmed/completed appointments in recent list to match revenue calculation
      const completedAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'completed')
      setRecentAppointments(completedAppointments.slice(0, 5))
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
        <h1 className="text-2xl font-extrabold font-headline text-on-surface tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm">Platform overview</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-fade-in-down">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium">Platform overview and management</p>
        </div>
      </div>

      {/* Mobile Stats - Horizontal Scroll */}
      <section className="md:hidden overflow-x-auto pb-2 animate-fade-in-up -mx-5 px-5">
        <div className="flex gap-4 pr-6">
          <div className="bg-surface-container-lowest p-4 rounded-2xl border flex-shrink-0" style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">people</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.totalUsers}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Users</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border flex-shrink-0" style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">medical_services</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.totalDoctors}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Doctors</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border flex-shrink-0" style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">event</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.totalAppointments}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Appointments</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border flex-shrink-0" style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">₹{stats.totalRevenue?.toFixed(2)}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Revenue</p>
          </div>
        </div>
      </section>

      {/* Desktop Stats Grid */}
      <section className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="people"
          value={stats.totalUsers}
          label="Total Users"
          description="Registered patients"
          badge="Total"
          variant="blue"
        />
        <StatCard
          icon="medical_services"
          value={stats.totalDoctors}
          label="Approved Doctors"
          description="Verified specialists"
          badge="Active"
          variant="emerald"
        />
        <StatCard
          icon="event"
          value={stats.totalAppointments}
          label="Total Appointments"
          description="Booked consultations"
          badge="All Time"
          variant="purple"
        />
        <StatCard
          icon="payments"
          value={`₹${stats.totalRevenue?.toFixed(2)}`}
          label="Total Revenue"
          description="Platform earnings"
          badge="Revenue"
          variant="indigo"
        />
      </section>

      {/* Pending Doctors Alert */}
      {stats.pendingDoctors > 0 && (
        <div className="bg-surface-container-low p-6 rounded-3xl border border-amber-200 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600">pending_actions</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-on-surface">
                {stats.pendingDoctors} doctor{stats.pendingDoctors > 1 ? 's' : ''} pending approval
              </p>
              <p className="text-sm text-on-surface-variant">Review and approve new doctor registrations</p>
            </div>
            <Link to="/admin/doctors" className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md">
              Review Now
            </Link>
          </div>
        </div>
      )}

      {/* Recent Appointments Table */}
      <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,82,174,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold font-headline text-on-surface">Recent Appointments</h2>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Latest bookings on the platform</p>
          </div>
          <Link to="/admin/appointments" className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-all">
            View All
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} height="h-16" />
        ) : recentAppointments.length === 0 ? (
          <EmptyState icon="event_busy" message="No appointments yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant border-b" style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 20%, transparent)'}}>
                  <th className="pb-4">Patient</th>
                  <th className="pb-4">Doctor</th>
                  <th className="pb-4">Date & Time</th>
                  <th className="pb-4">Fee</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentAppointments.map((appt) => (
                  <tr key={appt._id} className="border-b last:border-0 transition-all duration-200 hover:bg-surface-container-high/50" style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                          {appt.user?.name?.charAt(0) || 'P'}
                        </div>
                        <span className="font-medium text-on-surface">{appt.user?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-on-surface-variant">{appt.doctor?.user?.name}</td>
                    <td className="py-4 text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {appt.slot.date} {appt.slot.startTime}
                      </div>
                    </td>
                    <td className="py-4 font-bold text-on-surface">₹{appt.totalFee}</td>
                    <td className="py-3">
                      <StatusBadge status={appt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
