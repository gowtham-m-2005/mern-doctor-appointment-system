import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { Search, MapPin, DollarSign, Star, Calendar, Clock, Check, X, GraduationCap } from 'lucide-react'

const Doctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [slots, setSlots] = useState([])
  const [bookingSlot, setBookingSlot] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/users/doctors', { params: { search } })
      setDoctors(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchDoctors()
  }

  const viewSlots = async (doctor) => {
    setSelectedDoctor(doctor)
    try {
      const { data } = await api.get(`/users/doctors/${doctor._id}/slots`)
      setSlots(data)
    } catch (err) {
      console.error(err)
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
      setMessage('Appointment booked successfully!')
      setTimeout(() => {
        setSelectedDoctor(null)
        setBookingSlot(null)
        setMessage('')
      }, 2000)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed')
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
    return grouped
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Find Doctors</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? (
        <p className="text-center py-8">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xl font-bold">
                  {doctor.user?.name?.charAt(0) || 'D'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Dr. {doctor.user?.name}</h3>
                  <p className="text-primary-600 text-sm">{doctor.specialization}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{doctor.rating || 'New'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>{doctor.qualification}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.address || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium text-gray-900">${doctor.totalFee?.toFixed(2)}</span>
                  <span className="text-gray-400">(${doctor.fee} + commission)</span>
                </div>
              </div>

              <button
                onClick={() => viewSlots(doctor)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Select Time Slot</h2>
                <p className="text-gray-500">Dr. {selectedDoctor.user?.name}</p>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {message}
                </div>
              )}

              {slots.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No available slots</p>
              ) : (
                Object.entries(groupSlotsByDate()).map(([date, dateSlots]) => (
                  <div key={date}>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {date}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {dateSlots.map((slot) => (
                        <button
                          key={slot._id}
                          onClick={() => setBookingSlot(slot)}
                          className={`p-2 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors ${
                            bookingSlot?._id === slot._id
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {bookingSlot && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Selected:</p>
                      <p className="font-medium">
                        {bookingSlot.date} at {bookingSlot.startTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Fee:</p>
                      <p className="text-xl font-bold text-primary-600">${selectedDoctor.totalFee?.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={bookAppointment}
                    disabled={bookingLoading}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? 'Booking...' : <><Check className="w-4 h-4" /> Confirm Booking</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Doctors
