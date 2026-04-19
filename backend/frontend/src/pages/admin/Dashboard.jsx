import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { Users, Stethoscope, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react'

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of the platform</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalDoctors}</p>
            <p className="text-sm text-gray-500">Approved Doctors</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalAppointments}</p>
            <p className="text-sm text-gray-500">Total Appointments</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">${stats.totalRevenue?.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
        </div>
      </div>

      {stats.pendingDoctors > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">
                {stats.pendingDoctors} doctor{stats.pendingDoctors > 1 ? 's' : ''} pending approval
              </p>
            </div>
            <Link to="/admin/doctors" className="text-yellow-700 hover:underline font-medium">
              Review now
            </Link>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Appointments</h2>
          <Link to="/admin/appointments" className="text-primary-600 hover:underline text-sm">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : recentAppointments.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No appointments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Doctor</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Fee</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentAppointments.map((appt) => (
                  <tr key={appt._id} className="border-b last:border-0">
                    <td className="py-3">{appt.user?.name}</td>
                    <td className="py-3">{appt.doctor?.user?.name}</td>
                    <td className="py-3">
                      {appt.slot.date} {appt.slot.startTime}
                    </td>
                    <td className="py-3">${appt.totalFee}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        appt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        appt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                      }`}>
                        {appt.status}
                      </span>
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
