import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Filter } from 'lucide-react'
import api from '../../api/axios'

const STATUS_FILTERS = ['all', 'confirmed', 'completed', 'cancelled', 'pending']

const Appointments = () => {
  const location = useLocation()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [rescheduleModal, setRescheduleModal] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [doctorProfile, setDoctorProfile] = useState(null)
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
      confirmed: 'bg-secondary-container text-on-secondary-container',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-surface-variant text-on-surface-variant',
      cancelled: 'bg-error-container text-on-error-container',
      rescheduled: 'bg-purple-100 text-purple-700',
    }
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-surface-container-low'}`}>{status}</span>
  }

  const canCancel = (slot) => {
    const apptDateTime = new Date(slot.date)
    const diffHours = (apptDateTime - new Date()) / (1000 * 60 * 60)
    return diffHours > 24
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

  const openRescheduleModal = async (appt) => {
    setRescheduleModal(appt)
    setSelectedSlot(null)
    try {
      const { data } = await api.get(`/users/doctors/${appt.doctor._id}/slots`)
      setAvailableSlots(data.filter(s => !s.isBooked))
    } catch (err) {
      console.error(err)
    }
  }

  const handleReschedule = async () => {
    if (!selectedSlot || !rescheduleModal) return
    setRescheduleLoading(true)
    try {
      await api.put(`/appointments/${rescheduleModal._id}/reschedule`, {
        newSlot: {
          date: selectedSlot.date,
          startTime: selectedSlot.startTime
        },
        confirmed: true
      })
      setRescheduleModal(null)
      setSelectedSlot(null)
      fetchAppointments()
    } catch (err) {
      if (err.response?.data?.needsConfirmation) {
        // Auto-move to next available
        const confirm = window.confirm('Selected slot not available. Auto-move to next available slot?')
        if (confirm) {
          try {
            await api.put(`/appointments/${rescheduleModal._id}/reschedule`, {
              newSlot: {
                date: selectedSlot.date,
                startTime: selectedSlot.startTime
              },
              confirmed: true
            })
            setRescheduleModal(null)
            setSelectedSlot(null)
            fetchAppointments()
          } catch (err2) {
            alert(err2.response?.data?.message || 'Failed to reschedule')
          }
        }
      } else {
        alert(err.response?.data?.message || 'Failed to reschedule')
      }
    } finally {
      setRescheduleLoading(false)
    }
  }

  const upcomingAppointments = dateFilteredAppointments.filter(a => a.status === 'confirmed' || a.status === 'pending')
  const pastAppointments = dateFilteredAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled').sort((a, b) => {
    // Sort past appointments by date descending (latest first)
    const dateA = new Date(a.slot.date);
    const dateB = new Date(b.slot.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    // If same date, sort by time descending
    return b.slot.startTime.localeCompare(a.slot.startTime);
  })

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-10 max-w-7xl mx-auto">
      {/* Mobile Header */}
      <div className="md:hidden animate-fade-in-down">
        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">My Appointments</h1>
        <p className="text-on-surface-variant mt-1 text-sm">View and manage your appointments</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-end justify-between animate-fade-in-down">
        <div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">My Appointments</h1>
          <p className="text-on-surface-variant mt-2 text-lg">View and manage your appointments</p>
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
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-highest'
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
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-highest'
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
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-surface-container-lowest rounded-2xl">
          <span className="material-symbols-outlined text-5xl mb-3" style={{color: 'color-mix(in srgb, var(--on-surface-variant) 30%, transparent)'}}>event_busy</span>
          <p className="text-on-surface-variant">No appointments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          {/* Appointments List */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Upcoming Section */}
            {upcomingAppointments.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-on-surface">Upcoming Visits</h2>
                  <span className="h-[1px] flex-1 bg-outline-variant/20"></span>
                  <span className="bg-primary-fixed text-on-primary-fixed text-xs font-bold px-3 py-1 rounded-full">{upcomingAppointments.length} Scheduled</span>
                </div>

                <div className="space-y-4" key={`upcoming-${statusFilter}-${dateFilter}`}>
                  {upcomingAppointments.map((appt, index) => (
                    <div key={appt._id} data-appointment-id={appt._id} className={`bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-6 shadow-[0_4px_20px_rgba(0,82,174,0.04)] hover:shadow-[0_4px_32px_rgba(0,82,174,0.08)] transition-all animate-fade-in ${highlightAppointmentId === appt._id ? 'ring-2 ring-primary ring-offset-2' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="w-20 h-20 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-primary border border-primary/5">
                        <span className="text-xs font-bold uppercase tracking-widest">{new Date(appt.slot.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-2xl font-black">{new Date(appt.slot.date).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <button
                              onClick={() => setDoctorProfile(appt.doctor)}
                              className="text-lg font-bold text-on-surface hover:text-primary transition-colors text-left"
                            >
                              {appt.doctor?.user?.name || 'Unknown'}
                            </button>
                            <p className="text-primary text-sm font-semibold">{appt.doctor?.specialization}</p>
                            <p className="text-on-surface-variant text-sm mt-1">{appt.slot.startTime} - {appt.slot.endTime}</p>
                          </div>
                          {getStatusBadge(appt.status)}
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          {appt.prescription?.medicines?.length > 0 && (
                            <button
                              onClick={() => setSelectedPrescription(appt.prescription)}
                              className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                            >
                              <span className="material-symbols-outlined text-sm">description</span>
                              View Prescription
                            </button>
                          )}
                          {(appt.status === 'confirmed' || appt.status === 'pending') && (
                            <button
                              onClick={() => openRescheduleModal(appt)}
                              className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                            >
                              <span className="material-symbols-outlined text-sm">event_repeat</span>
                              Reschedule
                            </button>
                          )}
                          {appt.status === 'confirmed' && canCancel(appt.slot) && (
                            <button
                              onClick={() => cancelAppointment(appt._id)}
                              className="text-error text-xs font-bold flex items-center gap-1 hover:underline"
                            >
                              <span className="material-symbols-outlined text-sm">cancel</span>
                              Cancel
                            </button>
                          )}
                          {(appt.status === 'confirmed' || appt.status === 'pending') && !canCancel(appt.slot) && (
                            <span className="text-xs flex items-center gap-1" style={{color: 'color-mix(in srgb, var(--on-surface-variant) 60%, transparent)'}}>
                              <span className="material-symbols-outlined text-sm">info</span>
                              Cannot modify within 24h
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-on-surface-variant">Total Paid</p>
                        <p className="text-xl font-bold text-on-surface">₹{appt.totalFee}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Section */}
            {pastAppointments.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 pt-8">
                  <h2 className="text-xl font-bold text-on-surface">Past Appointments</h2>
                  <span className="h-[1px] flex-1 bg-outline-variant/20"></span>
                </div>
                <div className="space-y-4" key={`past-${statusFilter}-${dateFilter}`}>
                  {pastAppointments.map((appt, index) => (
                    <div key={appt._id} data-appointment-id={appt._id} className={`bg-surface-container-low/50 p-6 rounded-2xl flex items-center gap-6 opacity-80 hover:opacity-100 transition-all animate-fade-in ${highlightAppointmentId === appt._id ? 'ring-2 ring-primary ring-offset-2 opacity-100' : ''}`} style={{ animationDelay: `${(index + upcomingAppointments.length) * 50}ms` }}>
                      <div className="w-20 h-20 rounded-2xl bg-surface-container flex flex-col items-center justify-center text-on-surface-variant">
                        <span className="text-xs font-bold uppercase tracking-widest">{new Date(appt.slot.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-2xl font-black">{new Date(appt.slot.date).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <button
                              onClick={() => setDoctorProfile(appt.doctor)}
                              className="text-lg font-bold text-on-surface hover:text-primary transition-colors text-left"
                            >
                              {appt.doctor?.user?.name || 'Unknown'}
                            </button>
                            <p className="text-primary text-sm font-semibold">{appt.doctor?.specialization}</p>
                            <p className="text-on-surface-variant text-sm mt-1">{appt.slot.startTime} - {appt.slot.endTime}</p>
                          </div>
                          {getStatusBadge(appt.status)}
                        </div>
                        {appt.prescription?.medicines?.length > 0 && (
                          <div className="mt-4">
                            <button
                              onClick={() => setSelectedPrescription(appt.prescription)}
                              className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                            >
                              <span className="material-symbols-outlined text-sm">description</span>
                              View Prescription
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-on-surface-variant">Total Paid</p>
                        <p className="text-xl font-bold text-on-surface">₹{appt.totalFee}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Sidebar */}
          <div className="col-span-4 space-y-8">
            <div className="bg-surface-container-low rounded-3xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-extrabold text-primary mb-2">Quick Actions</h2>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">Manage your appointments</p>
                <div className="space-y-4">
                  <Link to="/doctors" className="block bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-primary/5 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">add_circle</span>
                      </div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">Book</span>
                    </div>
                    <h4 className="font-bold text-on-surface">New Appointment</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Find a specialist</p>
                  </Link>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Prescription Modal - Portal */}
      {selectedPrescription && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full animate-scale-in shadow-2xl">
            <div className="p-6 border-b style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)'}}">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined">description</span>
                Prescription
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {selectedPrescription.notes && (
                <div>
                  <h3 className="font-medium text-on-surface mb-2">Doctor's Notes</h3>
                  <p className="text-on-surface-variant bg-surface-container-low p-4 rounded-xl">{selectedPrescription.notes}</p>
                </div>
              )}
              <div>
                <h3 className="font-medium text-on-surface mb-3">Medicines</h3>
                <div className="space-y-2">
                  {selectedPrescription.medicines.map((med, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-primary-fixed p-4 rounded-xl">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      <div>
                        <p className="font-medium text-on-surface">{med.name}</p>
                        <p className="text-sm text-on-surface-variant">{med.dosage} • {med.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:bg-primary-container transition-all shadow-md shadow-primary/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reschedule Modal - Portal to render outside Layout */}
      {rescheduleModal && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] animate-fade-in overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full animate-scale-in max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)'}} flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined">event_repeat</span>
                Reschedule Appointment
              </h2>
              <button onClick={() => { setRescheduleModal(null); setSelectedSlot(null); }} className="p-2 hover:bg-surface-container-low rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-on-surface-variant text-sm">
                Select a new available slot with {rescheduleModal.doctor?.user?.name}
              </p>
              {availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl mb-2" style={{color: 'color-mix(in srgb, var(--on-surface-variant) 30%, transparent)'}}>event_busy</span>
                  <p className="text-on-surface-variant text-sm">No available slots</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot._id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl text-sm flex flex-col items-center transition-colors ${
                        selectedSlot?._id === slot._id
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container-low hover:bg-primary-fixed hover:text-primary'
                      }`}
                    >
                      <span className="font-medium">
                        {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs opacity-80">{slot.startTime} - {slot.endTime}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setRescheduleModal(null); setSelectedSlot(null); }}
                  className="flex-1 px-4 py-3 bg-surface-container-low text-on-surface rounded-xl font-bold hover:bg-surface-container-high transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={!selectedSlot || rescheduleLoading}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary-container transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                >
                  {rescheduleLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Doctor Profile Modal - Portal */}
      {doctorProfile && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full animate-scale-in shadow-2xl">
            <div className="p-6 border-b style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)'}} flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined">person</span>
                Doctor Profile
              </h2>
              <button onClick={() => setDoctorProfile(null)} className="p-2 hover:bg-surface-container-low rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">person</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{doctorProfile.user?.name}</h3>
                  <p className="text-primary font-medium">{doctorProfile.specialization}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">email</span>
                  <p className="text-on-surface-variant">{doctorProfile.user?.email}</p>
                </div>
                {doctorProfile.user?.phone && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">phone</span>
                    <p className="text-on-surface-variant">{doctorProfile.user.phone}</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">medical_services</span>
                  <p className="text-on-surface-variant">{doctorProfile.specialization}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">payments</span>
                  <p className="text-on-surface-variant">Consultation Fee: ₹{doctorProfile.fee}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)'}}">
              <button
                onClick={() => setDoctorProfile(null)}
                className="w-full px-4 py-3 bg-surface-container-low text-on-surface rounded-xl font-bold hover:bg-surface-container-high transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default Appointments
