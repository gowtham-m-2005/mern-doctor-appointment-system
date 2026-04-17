import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Calendar, Clock, X, FileText, User, CheckCircle, AlertCircle } from 'lucide-react'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/users/appointments')
      setAppointments(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    try {
      await api.put(`/users/appointments/${id}/cancel`)
      fetchAppointments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      rescheduled: 'bg-purple-100 text-purple-700',
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100'}`}>{status}</span>
  }

  const canCancel = (slot) => {
    const apptDateTime = new Date(`${slot.date}T${slot.startTime}`)
    const diffHours = (apptDateTime - new Date()) / (1000 * 60 * 60)
    return diffHours > 24
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500">View and manage your appointments</p>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading...</p>
      ) : appointments.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt._id} className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xl font-bold">
                    {appt.doctor?.user?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Dr. {appt.doctor?.user?.name || 'Unknown'}</h3>
                    <p className="text-primary-600 text-sm">{appt.doctor?.specialization}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {appt.slot.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appt.slot.startTime} - {appt.slot.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="font-bold text-lg">${appt.totalFee}</p>
                  </div>
                  {getStatusBadge(appt.status)}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                {appt.prescription?.medicines?.length > 0 && (
                  <button
                    onClick={() => setSelectedPrescription(appt.prescription)}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    View Prescription
                  </button>
                )}

                {appt.status === 'confirmed' && canCancel(appt.slot) && (
                  <button
                    onClick={() => cancelAppointment(appt._id)}
                    className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                )}

                {appt.status === 'confirmed' && !canCancel(appt.slot) && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Cannot cancel within 24h
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Prescription
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {selectedPrescription.notes && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Doctor's Notes</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPrescription.notes}</p>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Medicines</h3>
                <div className="space-y-2">
                  {selectedPrescription.medicines.map((med, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-primary-50 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-600">{med.dosage} • {med.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="w-full btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointments
