import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import { Calendar, Clock, FileText, Stethoscope, ChevronRight } from 'lucide-react'

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

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100'}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-500">Here's your health overview</p>
        </div>
        <Link to="/doctors" className="btn-primary flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          Book Appointment
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
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
            <p className="text-2xl font-bold">{stats.upcoming}</p>
            <p className="text-sm text-gray-500">Upcoming</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Appointments</h2>
          <Link to="/my-appointments" className="text-primary-600 hover:underline text-sm flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading...</p>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No appointments yet</p>
            <Link to="/doctors" className="btn-primary">Book your first appointment</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div key={appt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                    {appt.doctor?.user?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="font-medium">{appt.doctor?.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">
                      {appt.slot.date} at {appt.slot.startTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">${appt.totalFee}</span>
                  {getStatusBadge(appt.status)}
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
