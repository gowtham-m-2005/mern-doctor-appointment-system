import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Calendar, Clock, User, FileText, CheckCircle, X } from 'lucide-react'

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [prescription, setPrescription] = useState({ notes: '', medicines: [{ name: '', dosage: '', duration: '' }] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/doctor/appointments')
      setAppointments(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addMedicine = () => {
    setPrescription({
      ...prescription,
      medicines: [...prescription.medicines, { name: '', dosage: '', duration: '' }],
    })
  }

  const updateMedicine = (idx, field, value) => {
    const updated = [...prescription.medicines]
    updated[idx][field] = value
    setPrescription({ ...prescription, medicines: updated })
  }

  const removeMedicine = (idx) => {
    setPrescription({
      ...prescription,
      medicines: prescription.medicines.filter((_, i) => i !== idx),
    })
  }

  const submitPrescription = async () => {
    if (!selectedAppt) return
    setSaving(true)
    try {
      await api.post('/doctor/prescription', {
        appointmentId: selectedAppt._id,
        notes: prescription.notes,
        medicines: prescription.medicines.filter((m) => m.name),
      })
      setSelectedAppt(null)
      setPrescription({ notes: '', medicines: [{ name: '', dosage: '', duration: '' }] })
      fetchAppointments()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100'}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500">Manage your patient appointments</p>
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
                    {appt.user?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{appt.user?.name}</h3>
                    <p className="text-gray-500 text-sm">{appt.user?.email}</p>
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
                    <p className="text-sm text-gray-500">Fee Earned</p>
                    <p className="font-bold text-lg">${appt.doctorFee}</p>
                  </div>
                  {getStatusBadge(appt.status)}
                </div>
              </div>

              {appt.status === 'completed' && (
                <div className="mt-4 pt-4 border-t">
                  {appt.prescription?.medicines?.length > 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Prescription added</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedAppt(appt)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Add Prescription
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedAppt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Add Prescription</h2>
                <p className="text-gray-500">Patient: {selectedAppt.user?.name}</p>
              </div>
              <button onClick={() => setSelectedAppt(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input min-h-[100px]"
                  value={prescription.notes}
                  onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
                  placeholder="Doctor's notes and recommendations..."
                />
              </div>

              <div>
                <label className="label">Medicines</label>
                <div className="space-y-3">
                  {prescription.medicines.map((med, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="input flex-1"
                        placeholder="Medicine name"
                        value={med.name}
                        onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        className="input w-28"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                      />
                      <input
                        type="text"
                        className="input w-28"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                      />
                      {prescription.medicines.length > 1 && (
                        <button onClick={() => removeMedicine(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addMedicine} className="mt-3 text-primary-600 hover:underline text-sm">
                  + Add another medicine
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setSelectedAppt(null)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button onClick={submitPrescription} disabled={saving} className="flex-1 btn-primary">
                  {saving ? 'Saving...' : 'Save Prescription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorAppointments
