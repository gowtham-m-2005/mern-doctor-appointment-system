import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import { Link } from 'react-router-dom'
import { Calendar, DollarSign, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react'

const DoctorDashboard = () => {
  const { doctor, user } = useAuthStore()
  const [stats, setStats] = useState({ total: 0, today: 0, completed: 0, totalEarnings: 0 })
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
      const todayAppts = apptsRes.data.filter((a) => a.slot.date === today && a.status === 'confirmed')
      setTodayAppointments(todayAppts.slice(0, 5))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (doctor?.isApproved === 'pending') {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Account Pending Approval</h2>
        <p className="text-gray-500">Your doctor account is under review. You'll be notified once approved.</p>
      </div>
    )
  }

  if (doctor?.isApproved === 'rejected') {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Account Rejected</h2>
        <p className="text-gray-500">Your application was not approved. Please contact support.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, Dr. {user?.name}</h1>
        <p className="text-gray-500">Manage your practice and appointments</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Appointments</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.today}</p>
            <p className="text-sm text-gray-500">Today's Appointments</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">${stats.totalEarnings}</p>
            <p className="text-sm text-gray-500">Total Earnings</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Schedule</h2>
            <Link to="/doctor/appointments" className="text-primary-600 hover:underline text-sm">
              View all
            </Link>
          </div>

          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appt) => (
                <div key={appt._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                    {appt.user?.name?.charAt(0) || 'P'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{appt.user?.name}</p>
                    <p className="text-sm text-gray-500">{appt.slot.startTime} - {appt.slot.endTime}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/doctor/profile" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Manage Profile</p>
                <p className="text-sm text-gray-500">Update your information and availability</p>
              </div>
            </Link>
            <Link to="/doctor/appointments" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">View Appointments</p>
                <p className="text-sm text-gray-500">See all your patient appointments</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
