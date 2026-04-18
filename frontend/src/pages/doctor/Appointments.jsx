import { useEffect, useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Filter } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const STATUS_FILTERS = ['all', 'confirmed', 'completed', 'cancelled', 'pending']

const DoctorAppointments = () => {
  const location = useLocation()
  const scrollRef = useRef(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [prescription, setPrescription] = useState({ notes: '', medicines: [{ name: '', dosage: '', duration: '' }] })
  const [saving, setSaving] = useState(false)
  const [highlightAppointmentId, setHighlightAppointmentId] = useState(null)

  useEffect(() => {
    fetchAppointments()
    if (location.state?.highlightAppointmentId) {
      setHighlightAppointmentId(location.state.highlightAppointmentId)
      setTimeout(() => setHighlightAppointmentId(null), 2000)
    }
  }, [location.state])

  useEffect(() => {
    if (highlightAppointmentId && !loading) {
      const scrollToElement = (retries = 3) => {
        const element = document.querySelector(`[data-appointment-id="${highlightAppointmentId}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (retries > 0) {
          setTimeout(() => scrollToElement(retries - 1), 200)
        }
      }
      const scrollTimeout = setTimeout(() => scrollToElement(), 500)
      return () => clearTimeout(scrollTimeout)
    }
  }, [highlightAppointmentId, loading])

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

  const completeAppointment = async (apptId) => {
    try {
      await api.put(`/doctor/appointments/${apptId}/complete`)
      toast.success('Appointment marked as completed')
      fetchAppointments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete appointment')
    }
  }

  const confirmAppointment = async (apptId) => {
    try {
      await api.put(`/doctor/appointments/${apptId}/confirm`)
      toast.success('Appointment confirmed')
      fetchAppointments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm appointment')
    }
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

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-secondary-container text-on-secondary-container',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-surface-variant text-on-surface-variant',
      cancelled: 'bg-error-container text-on-error-container',
    }
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-surface-container-low'}`}>{status}</span>
  }

  const upcomingAppointments = dateFilteredAppointments.filter(a => a.status === 'confirmed' || a.status === 'pending')
  const pastAppointments = dateFilteredAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled')

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-10 max-w-7xl mx-auto">
      {/* Mobile Header */}
      <div className="flex items-center justify-between animate-fade-in-down md:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">My Appointments</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Manage your schedule</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">filter_list</span>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-end justify-between animate-fade-in-down">
        <div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">My Appointments</h1>
          <p className="text-on-surface-variant mt-2 text-lg">Manage your schedule and patient consultations.</p>
        </div>
      </div>

      {/* Status Filter */}
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant mt-4">Loading appointments...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mobile Appointments */}
          <div className="md:hidden space-y-6">
            {/* Mobile Section Label */}
            {upcomingAppointments.length > 0 && (
              <>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-on-surface">Upcoming Visits</h2>
                  <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-2 py-0.5 rounded-full">{upcomingAppointments.length}</span>
                </div>

                <div className="space-y-3" key={`mobile-upcoming-${statusFilter}-${dateFilter}`}>
                  {upcomingAppointments.map((appt, index) => (
                  <div key={appt._id} data-appointment-id={appt._id} className={`bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 shadow-sm animate-fade-in ${highlightAppointmentId === appt._id ? 'ring-2 ring-primary ring-offset-2' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="w-14 h-14 rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-primary border border-primary/5 flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(appt.slot.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-xl font-black">{new Date(appt.slot.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-sm font-bold text-on-surface truncate">{appt.user?.name}</h3>
                        {getStatusBadge(appt.status)}
                      </div>
                      <p className="text-xs text-on-surface-variant">{appt.slot.startTime} - {appt.slot.endTime}</p>
                      {appt.status === 'pending' && (
                        <button
                          onClick={() => confirmAppointment(appt._id)}
                          className="mt-2 text-xs font-bold text-primary flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Confirm
                        </button>
                      )}
                      {appt.status === 'confirmed' && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => setSelectedAppt(appt)}
                            className="text-xs font-bold text-primary flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">description</span>
                            Add Prescription
                          </button>
                          <button
                            onClick={() => completeAppointment(appt._id)}
                            className="text-xs font-bold text-emerald-600 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Complete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
                </>
              )}

            {pastAppointments.length > 0 && (
              <>
                <div className="flex items-center gap-3 pt-4">
                  <h2 className="text-lg font-bold text-on-surface">Past Appointments</h2>
                </div>
                <div className="space-y-3" key={`mobile-past-${statusFilter}-${dateFilter}`}>
                  {pastAppointments.map((appt, index) => (
                    <div key={appt._id} data-appointment-id={appt._id} className={`bg-surface-container-low/50 p-4 rounded-2xl flex items-center gap-4 opacity-80 animate-fade-in ${highlightAppointmentId === appt._id ? 'ring-2 ring-primary ring-offset-2 opacity-100' : ''}`} style={{ animationDelay: `${(index + upcomingAppointments.length) * 50}ms` }}>
                      <div className="w-14 h-14 rounded-xl bg-surface-container flex flex-col items-center justify-center text-on-surface-variant flex-shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(appt.slot.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-xl font-black">{new Date(appt.slot.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-sm font-bold text-on-surface truncate">{appt.user?.name}</h3>
                          {getStatusBadge(appt.status)}
                        </div>
                        <p className="text-xs text-on-surface-variant">{appt.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Mobile Quick Actions */}
            <div className="bg-surface-container-low rounded-2xl p-4">
              <h3 className="text-sm font-bold text-on-surface mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/doctor/profile" className="bg-surface-container-lowest p-3 rounded-xl block hover:bg-surface-container-high transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-2">
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">Add Slots</span>
                </Link>
                <div className="bg-surface-container-lowest p-3 rounded-xl opacity-60">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant mb-2">
                    <span className="material-symbols-outlined text-sm">payments</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">Earnings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Appointments */}
          <div className="hidden md:grid grid-cols-12 gap-8">
            {/* Appointments List (LHS) */}
            <div className="col-span-8 space-y-6">
              {/* Section Label */}
              {upcomingAppointments.length > 0 && (
                <>
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-on-surface">Upcoming Visits</h2>
                    <span className="h-[1px] flex-1 bg-outline-variant/20"></span>
                    <span className="bg-primary-fixed text-on-primary-fixed text-xs font-bold px-3 py-1 rounded-full">{upcomingAppointments.length} Scheduled</span>
                  </div>

                  <div className="space-y-4" key={`desktop-upcoming-${statusFilter}-${dateFilter}`}>
                    {upcomingAppointments.map((appt, index) => (
                    <div key={appt._id} data-appointment-id={appt._id} className={`bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-6 shadow-[0_12px_32px_rgba(0,82,174,0.04)] hover:shadow-[0_12px_48px_rgba(0,82,174,0.08)] transition-all group animate-fade-in ${highlightAppointmentId === appt._id ? 'ring-2 ring-primary ring-offset-2' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="w-20 h-20 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-primary border border-primary/5">
                        <span className="text-xs font-bold uppercase tracking-widest">{new Date(appt.slot.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-2xl font-black">{new Date(appt.slot.date).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-on-surface">{appt.user?.name}</h3>
                            <p className="text-sm text-on-surface-variant">Consultation • {appt.slot.startTime} - {appt.slot.endTime}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(appt.status)}
                            {appt.status === 'pending' && (
                              <button
                                onClick={() => confirmAppointment(appt._id)}
                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Confirm
                              </button>
                            )}
                            {appt.status === 'confirmed' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedAppt(appt)}
                                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-sm">description</span>
                                  Prescription
                                </button>
                                <button
                                  onClick={() => completeAppointment(appt._id)}
                                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-sm">check_circle</span>
                                  Complete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <span className="text-on-surface-variant text-sm">{appt.user?.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </>
              )}

              {/* Section Label: Past */}
              {pastAppointments.length > 0 && (
                <>
                  <div className="flex items-center gap-4 pt-8">
                    <h2 className="text-xl font-bold text-on-surface">Past Appointments</h2>
                    <span className="h-[1px] flex-1 bg-outline-variant/20"></span>
                  </div>
                  <div className="space-y-4" key={`desktop-past-${statusFilter}-${dateFilter}`}>
                    {pastAppointments.map((appt, index) => (
                      <div key={appt._id} data-appointment-id={appt._id} className={`bg-surface-container-low/50 p-6 rounded-2xl flex items-center gap-6 opacity-80 hover:opacity-100 transition-all animate-fade-in ${highlightAppointmentId === appt._id ? 'ring-2 ring-primary ring-offset-2 opacity-100' : ''}`} style={{ animationDelay: `${(index + upcomingAppointments.length) * 50}ms` }}>
                        <div className="w-20 h-20 rounded-2xl bg-surface-container flex flex-col items-center justify-center text-on-surface-variant">
                          <span className="text-xs font-bold uppercase tracking-widest">{new Date(appt.slot.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-2xl font-black">{new Date(appt.slot.date).getDate()}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-on-surface">{appt.user?.name}</h3>
                              <p className="text-sm text-on-surface-variant">Consultation • {appt.status}</p>
                            </div>
                            {getStatusBadge(appt.status)}
                          </div>
                          {appt.status === 'completed' && (
                            <div className="mt-4 flex items-center gap-4">
                              {appt.prescription?.medicines?.length > 0 ? (
                                <span className="text-on-surface-variant text-xs font-bold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">check_circle</span>
                                  Prescription added
                                </span>
                              ) : (
                                <span className="text-error text-xs font-bold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">error</span>
                                  No prescription
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          {/* Sidebar (RHS) */}
            <div className="col-span-4 space-y-8">
              {/* Suggested Follow-ups */}
              <section className="bg-surface-container-low rounded-3xl p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-2xl font-extrabold text-primary mb-2">Quick Actions</h2>
                  <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">Manage your practice efficiently</p>
                  <div className="space-y-4">
                    <Link to="/doctor/profile" className="block bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-primary/5 hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">add_circle</span>
                        </div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">Slots</span>
                      </div>
                      <h4 className="font-bold text-on-surface">Add Availability</h4>
                      <p className="text-xs text-on-surface-variant mt-1">Manage your time slots</p>
                    </Link>
                    <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-primary/5 opacity-60">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant">
                          <span className="material-symbols-outlined">payments</span>
                        </div>
                        <span className="text-xs font-bold text-on-secondary-fixed-variant uppercase tracking-wide">Earnings</span>
                      </div>
                      <h4 className="font-bold text-on-surface">View Earnings</h4>
                      <p className="text-xs text-on-surface-variant mt-1">Track your income</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
              </section>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-3xl text-white shadow-xl shadow-primary/20">
                <div className="flex items-center justify-between mb-8">
                  <span className="material-symbols-outlined text-3xl opacity-80">calendar_month</span>
                  <span className="bg-white/20 text-[10px] uppercase font-bold px-2 py-1 rounded">Live Status</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/70 font-medium uppercase tracking-widest">Total Appointments</p>
                    <h3 className="text-xl font-bold mt-1">{appointments.length}</h3>
                    <p className="text-sm text-white/60">{upcomingAppointments.length} upcoming</p>
                  </div>
                  <div className="h-[1px] bg-white/10"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-lg font-black">{appointments.length > 0 ? Math.round((pastAppointments.filter(a => a.status === 'completed').length / appointments.length) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Prescription Modal - Portal */}
      {selectedAppt && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Add Prescription</h2>
                <p className="text-on-surface-variant">Patient: {selectedAppt.user?.name}</p>
              </div>
              <button onClick={() => setSelectedAppt(null)} className="p-2 hover:bg-surface-container-low rounded-xl transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Notes</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-container-low min-h-[120px]"
                  value={prescription.notes}
                  onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
                  placeholder="Doctor's notes and recommendations..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Medicines</label>
                <div className="space-y-3">
                  {prescription.medicines.map((med, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-low"
                        placeholder="Medicine name"
                        value={med.name}
                        onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        className="w-28 px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-low"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                      />
                      <input
                        type="text"
                        className="w-28 px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-low"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                      />
                      {prescription.medicines.length > 1 && (
                        <button onClick={() => removeMedicine(idx)} className="p-3 text-error hover:bg-error-container rounded-xl transition-colors">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addMedicine} className="mt-3 text-primary text-xs font-bold hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add another medicine
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setSelectedAppt(null)} className="flex-1 px-6 py-3 bg-surface-container-low text-on-surface rounded-xl font-bold hover:bg-surface-container-high transition-all">
                  Cancel
                </button>
                <button onClick={submitPrescription} disabled={saving} className="flex-1 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-container transition-all shadow-md shadow-primary/10 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Prescription'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default DoctorAppointments
