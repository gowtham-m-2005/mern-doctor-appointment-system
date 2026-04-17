import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../../api/axios'

const Doctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [bookingSlot, setBookingSlot] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async (q = search) => {
    setLoading(true)
    try {
      const { data } = await api.get('/users/doctors', { params: q ? { search: q } : {} })
      setDoctors(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchDoctors(search)
  }

  const filterBySpecialty = (specialty) => {
    setSearch(specialty)
    fetchDoctors(specialty)
  }

  const viewSlots = async (doctor) => {
    setSelectedDoctor(doctor)
    setBookingSlot(null)
    setMessage({ text: '', type: '' })
    setSlotsLoading(true)
    try {
      const { data } = await api.get(`/users/doctors/${doctor._id}/slots`)
      setSlots(data)
    } catch (err) {
      console.error(err)
    } finally {
      setSlotsLoading(false)
    }
  }

  const bookAppointment = async () => {
    if (!bookingSlot || !selectedDoctor) return
    setBookingLoading(true)
    try {
      await api.post('/users/appointments', {
        doctorId: selectedDoctor._id,
        slot: bookingSlot,
      })
      setMessage({ text: 'Appointment booked successfully! You will receive a confirmation notification.', type: 'success' })
      const { data } = await api.get(`/users/doctors/${selectedDoctor._id}/slots`)
      setSlots(data)
      setBookingSlot(null)
      setTimeout(() => {
        setSelectedDoctor(null)
        setMessage({ text: '', type: '' })
      }, 2500)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Booking failed. Please try again.', type: 'error' })
    } finally {
      setBookingLoading(false)
    }
  }

  const groupSlotsByDate = () => {
    const grouped = {}
    slots.forEach((slot) => {
      if (!grouped[slot.date]) grouped[slot.date] = []
      grouped[slot.date].push(slot)
    })
    return Object.fromEntries(Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Invalid Date'
    // Handle ISO date strings (2026-04-22T00:00:00.000Z) or date-only strings (2026-04-22)
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-10 animate-fade-in pb-32">
      {/* Hero Search Section */}
      <section className="animate-fade-in-down">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Find Doctors</h1>
        <p className="text-on-surface-variant font-medium text-sm mb-6">Expert medical care, just a tap away.</p>
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all shadow-sm"
            placeholder="Specialist, clinic, or doctor name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </section>

      {/* Specialized Categories (Bento-lite) */}
      <section className="animate-fade-in-up">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Specialties</h2>
          {search && (
            <button onClick={() => { setSearch(''); fetchDoctors(''); }} className="text-sm font-semibold text-primary">Clear Filter</button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => filterBySpecialty('Neurology')}
            className="bg-secondary-container p-5 rounded-2xl flex flex-col gap-3 items-start justify-between h-32 text-left hover:scale-[1.02] transition-transform"
          >
            <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
            <span className="font-bold text-on-secondary-container">Neurology</span>
          </button>
          <button
            onClick={() => filterBySpecialty('Cardiology')}
            className="bg-tertiary-fixed p-5 rounded-2xl flex flex-col gap-3 items-start justify-between h-32 text-left hover:scale-[1.02] transition-transform"
          >
            <span className="material-symbols-outlined text-tertiary text-3xl">favorite</span>
            <span className="font-bold text-on-tertiary-fixed">Cardiology</span>
          </button>
        </div>
      </section>

      {/* Doctor List */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold tracking-tight">Top Specialists</h2>
          {search && (
            <button onClick={() => { setSearch(''); fetchDoctors(''); }} className="text-sm font-semibold text-primary">Clear</button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-surface-container-lowest h-40 rounded-[1.25rem] animate-pulse" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-lowest rounded-2xl">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">search_off</span>
            <p className="text-on-surface-variant">No doctors found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="bg-surface-container-lowest p-5 rounded-[1.25rem] shadow-[0_4px_20px_rgba(0,82,174,0.04)] relative overflow-hidden flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary text-2xl font-bold">
                      {doctor.user?.name?.charAt(0) || 'D'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm border border-outline-variant/10">
                      <span className="material-symbols-outlined text-[12px] text-yellow-500">star</span>
                      <span className="text-[10px] font-bold">{doctor.rating > 0 ? doctor.rating.toFixed(1) : 'New'}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-on-surface leading-tight">Dr. {doctor.user?.name}</h3>
                    </div>
                    <p className="text-primary text-sm font-semibold mb-1">{doctor.specialization}</p>
                    <div className="flex items-center gap-1 text-on-surface-variant text-[11px]">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span>{doctor.address || 'Online Consultation'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-outline">Consultation Fee</p>
                    <p className="text-sm font-semibold text-on-surface">₹{doctor.totalFee?.toFixed(0) || doctor.fee}</p>
                  </div>
                  <button
                    onClick={() => viewSlots(doctor)}
                    className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Slot Booking Modal - Portal */}
      {selectedDoctor && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] animate-fade-in flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-in shadow-2xl">
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Select Time Slot</h2>
                <p className="text-on-surface-variant">Dr. {selectedDoctor.user?.name} • {selectedDoctor.specialization}</p>
              </div>
              <button
                onClick={() => { setSelectedDoctor(null); setMessage({ text: '', type: '' }) }}
                className="p-2 hover:bg-surface-container-low rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {message.text && (
                <div className={`p-4 rounded-2xl text-sm flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-error-container text-on-error-container'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {message.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  {message.text}
                </div>
              )}

              {slotsLoading ? (
                <div className="space-y-3">
                  {[1,2].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-surface-container-high rounded w-24 mb-2" />
                      <div className="grid grid-cols-4 gap-2">
                        {[1,2,3,4].map(j => <div key={j} className="h-9 bg-surface-container-high rounded-xl" />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">event_busy</span>
                  <p className="text-on-surface-variant">No available slots for this doctor</p>
                  <p className="text-on-surface-variant/60 text-sm mt-1">Check back later or try another doctor</p>
                </div>
              ) : (
                Object.entries(groupSlotsByDate()).map(([date, dateSlots]) => (
                  <div key={date}>
                    <h3 className="font-medium text-on-surface mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
                      {formatDate(date)}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {dateSlots.map((slot) => (
                        <button
                          key={slot._id}
                          onClick={() => setBookingSlot(slot)}
                          className={`p-3 rounded-xl text-sm flex items-center justify-center gap-1 transition-colors ${
                            bookingSlot?._id === slot._id
                              ? 'bg-primary text-on-primary shadow-sm'
                              : 'bg-surface-container-low hover:bg-primary-fixed hover:text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {bookingSlot && (
              <div className="p-6 border-t border-outline-variant/10 bg-surface-container-low flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-on-surface-variant">Selected slot</p>
                    <p className="font-semibold text-on-surface">
                      {formatDate(bookingSlot.date)} at {bookingSlot.startTime}
                      {bookingSlot.endTime && ` – ${bookingSlot.endTime}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-on-surface-variant">Total Fee</p>
                    <p className="text-xl font-bold text-primary">
                      ₹{selectedDoctor.totalFee?.toFixed(0) || selectedDoctor.fee}
                    </p>
                  </div>
                </div>
                <button
                  onClick={bookAppointment}
                  disabled={bookingLoading}
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:bg-primary-container transition-all shadow-md shadow-primary/10 disabled:opacity-60 active:scale-[0.98]"
                >
                  {bookingLoading ? (
                    <span>Booking...</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">check_circle</span>
                      Confirm Booking
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default Doctors
