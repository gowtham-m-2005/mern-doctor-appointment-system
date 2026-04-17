import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

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
      setRecentAppointments(apptsRes.data.slice(0, 5))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-secondary-container text-on-secondary-container',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-surface-variant text-on-surface-variant',
      cancelled: 'bg-error-container text-on-error-container',
    }
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-surface-container-low'}`}>{status}</span>
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
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 shadow-sm flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">people</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.totalUsers}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Users</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 shadow-sm flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">medical_services</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.totalDoctors}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Doctors</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 shadow-sm flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">event</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">{stats.totalAppointments}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Appointments</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 shadow-sm flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
            <p className="text-2xl font-extrabold font-headline text-on-surface">${stats.totalRevenue?.toFixed(2)}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Revenue</p>
          </div>
        </div>
      </section>

      {/* Desktop Stats Grid */}
      <section className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">people</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-lg">Total</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Total Users</p>
          <h3 className="text-3xl font-extrabold font-headline mt-1 text-on-surface">{stats.totalUsers}</h3>
          <p className="text-[11px] text-on-surface-variant mt-2">Registered patients</p>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined">medical_services</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-lg">Active</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Approved Doctors</p>
          <h3 className="text-3xl font-extrabold font-headline mt-1 text-on-surface">{stats.totalDoctors}</h3>
          <p className="text-[11px] text-on-surface-variant mt-2">Verified specialists</p>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined">event</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-lg">All Time</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Total Appointments</p>
          <h3 className="text-3xl font-extrabold font-headline mt-1 text-on-surface">{stats.totalAppointments}</h3>
          <p className="text-[11px] text-on-surface-variant mt-2">Booked consultations</p>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-lg">Revenue</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-3xl font-extrabold font-headline mt-1 text-on-surface">${stats.totalRevenue?.toFixed(2)}</h3>
          <p className="text-[11px] text-on-surface-variant mt-2">Platform earnings</p>
        </div>
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
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface-container-low h-16 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentAppointments.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">event_busy</span>
            <p className="text-on-surface-variant">No appointments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/20">
                  <th className="pb-4">Patient</th>
                  <th className="pb-4">Doctor</th>
                  <th className="pb-4">Date & Time</th>
                  <th className="pb-4">Fee</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentAppointments.map((appt) => (
                  <tr key={appt._id} className="border-b border-outline-variant/10 last:border-0 transition-all duration-200 hover:bg-surface-container-low">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                          {appt.user?.name?.charAt(0) || 'P'}
                        </div>
                        <span className="font-medium text-on-surface">{appt.user?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-on-surface-variant">Dr. {appt.doctor?.user?.name}</td>
                    <td className="py-4 text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {appt.slot.date} {appt.slot.startTime}
                      </div>
                    </td>
                    <td className="py-4 font-bold text-on-surface">${appt.totalFee}</td>
                    <td className="py-3">
                      {getStatusBadge(appt.status)}
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
