import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { Calendar, Clock, DollarSign, Filter, RefreshCw } from 'lucide-react'

const STATUS_FILTERS = ['all', 'confirmed', 'completed', 'cancelled', 'pending']

const AdminAppointments = () => {
  const location = useLocation()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(null)
  const [highlightAppointmentId, setHighlightAppointmentId] = useState(null)
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  useEffect(() => {
    fetchAppointments()
    if (location.state?.highlightAppointmentId) {
      setHighlightAppointmentId(location.state.highlightAppointmentId)
      setTimeout(() => setHighlightAppointmentId(null), 2000)
    }
  }, [location.state])

  useEffect(() => {
    if (highlightAppointmentId && !loading) {
      setTimeout(() => {
        const element = document.querySelector(`[data-appointment-id="${highlightAppointmentId}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }, [highlightAppointmentId, loading])

  const fetchAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/admin/appointments')
      // Handle both array (old) and paginated (new) responses
      if (Array.isArray(data)) {
        setAppointments(data)
        setTotal(data.length)
      } else {
        setAppointments(data.appointments || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      confirmed:   'bg-green-fixed text-green',
      completed:   'bg-blue-fixed text-blue',
      cancelled:   'bg-error-container text-on-error-container',
      pending:     'bg-tertiary-fixed text-tertiary',
      rescheduled: 'bg-purple-fixed text-purple',
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-surface-container-high text-on-surface-variant'}`}>
        {status}
      </span>
    )
  }

  const filteredAppointments = statusFilter === 'all'
    ? appointments
    : appointments.filter(a => a.status === statusFilter)

  const dateFilteredAppointments = filteredAppointments.filter(a => {
    if (dateFilter === 'all') return true
    const slotDate = new Date(a.slot.date).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    
    if (dateFilter === 'today') return slotDate === today
    if (dateFilter === 'tomorrow') return slotDate === tomorrow
    return true
  })

  const revenue = dateFilteredAppointments
    .filter((a) => ['confirmed', 'completed'].includes(a.status))
    .reduce((sum, a) => sum + (a.commission || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Appointments</h1>
          <p className="text-on-surface-variant">Monitor all platform appointments</p>
        </div>
        <button
          onClick={fetchAppointments}
          className="px-4 py-2 bg-surface-container-low text-on-surface rounded-xl font-medium hover:bg-surface-container-high transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: dateFilteredAppointments.length,          bg: 'bg-surface-container-high',    text: 'text-on-surface' },
          { label: 'Confirmed', value: dateFilteredAppointments.filter(a => a.status === 'confirmed').length,  bg: 'bg-green-fixed',  text: 'text-green' },
          { label: 'Completed', value: dateFilteredAppointments.filter(a => a.status === 'completed').length,  bg: 'bg-blue-fixed',   text: 'text-blue' },
          { label: 'Cancelled', value: dateFilteredAppointments.filter(a => a.status === 'cancelled').length,  bg: 'bg-error-container',    text: 'text-on-error-container' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-low rounded-2xl flex items-center gap-3 p-4 shadow-sm">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
              <Calendar className={`w-5 h-5 ${s.text}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-on-surface">{s.value}</p>
              <p className="text-xs text-on-surface-variant">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-2 flex-wrap mt-3">
        <span className="text-sm font-medium text-on-surface-variant">Date:</span>
        {['all', 'today', 'tomorrow'].map((d) => (
          <button
            key={d}
            onClick={() => setDateFilter(d)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              dateFilter === d
                ? 'bg-secondary text-on-secondary shadow-md shadow-secondary/10'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Revenue earned from visible appointments */}
      <div className="bg-surface-container-low rounded-2xl flex items-center gap-4 p-5 shadow-sm border border-primary/10">
        <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">₹{revenue.toFixed(2)}</p>
          <p className="text-sm text-on-surface-variant">Platform commission from visible appointments</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-on-surface-variant" />
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              statusFilter === s
                ? 'bg-primary text-on-primary shadow-md shadow-primary/10'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-on-surface-variant mt-4">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-error mb-2">{error}</p>
            <button onClick={fetchAppointments} className="text-primary font-medium hover:underline">Try again</button>
          </div>
        ) : dateFilteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
            <p className="text-on-surface-variant">No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-high border-b border-outline-variant/10">
                <tr className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Doctor</th>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Doctor Fee</th>
                  <th className="px-6 py-3">Commission</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10" key={`table-${statusFilter}-${dateFilter}`}>
                {dateFilteredAppointments.map((appt, index) => (
                  <tr key={appt._id} data-appointment-id={appt._id} className={`hover:bg-surface-container-high/50 transition-colors animate-fade-in ${highlightAppointmentId === appt._id ? 'bg-primary/10' : ''}`} style={{ animationDelay: `${index * 30}ms` }}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-on-surface">{appt.user?.name || '—'}</p>
                      <p className="text-xs text-on-surface-variant/60">{appt.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-on-surface">Dr. {appt.doctor?.user?.name || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-on-surface">
                        <Calendar className="w-3.5 h-3.5 text-on-surface-variant" />
                        {formatDate(appt.slot?.date)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant/60 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {appt.slot?.startTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">₹{appt.doctorFee}</td>
                    <td className="px-6 py-4 text-sm text-primary font-medium">₹{appt.commission?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">₹{appt.totalFee}</td>
                    <td className="px-6 py-4">{getStatusBadge(appt.status)}</td>
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

export default AdminAppointments
