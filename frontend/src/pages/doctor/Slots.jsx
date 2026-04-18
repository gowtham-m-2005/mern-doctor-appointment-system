import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import { Link } from 'react-router-dom'

// Generate time options in 30-min intervals from 8:00 AM to 8:00 PM
const generateTimeOptions = () => {
  const times = []
  for (let hour = 8; hour <= 20; hour++) {
    for (let min of [0, 30]) {
      if (hour === 20 && min === 30) continue
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
      const label = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      times.push({ value: time, label })
    }
  }
  return times
}

const TIME_OPTIONS = generateTimeOptions()

const formatDate = (dateStr) => {
  if (!dateStr) return 'Invalid Date'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Invalid Date'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const DoctorSlots = () => {
  const { user } = useAuthStore()
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [newSlots, setNewSlots] = useState([{ date: '', startTime: '', endTime: '' }])

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const { data } = await api.get('/doctor/profile')
      const availableSlots = data?.availableSlots?.filter((s) => !s.isBooked) || []
      setSlots(availableSlots)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addSlots = async (e) => {
    e.preventDefault()
    const validSlots = newSlots.filter((s) => s.date && s.startTime && s.endTime)
    if (validSlots.length === 0) return

    setSaving(true)
    try {
      await api.post('/doctor/slots', { slots: validSlots })
      setNewSlots([{ date: '', startTime: '', endTime: '' }])
      await fetchSlots()
      setMessage('Slots added successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add slots')
    } finally {
      setSaving(false)
    }
  }

  const removeSlot = async (slotId) => {
    try {
      await api.delete(`/doctor/slots/${slotId}`)
      fetchSlots()
    } catch (err) {
      console.error(err)
    }
  }

  const addSlotRow = () => {
    setNewSlots([...newSlots, { date: '', startTime: '', endTime: '' }])
  }

  const removeSlotRow = (idx) => {
    setNewSlots(newSlots.filter((_, i) => i !== idx))
  }

  const updateSlot = (idx, field, value) => {
    const updated = [...newSlots]
    updated[idx][field] = value
    setNewSlots(updated)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant mt-4">Loading slots...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface tracking-tight">
            Manage Availability
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium">
            Set your available time slots for appointments
          </p>
        </div>
        <Link to="/doctor/profile" className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-all">
          Back to Profile
        </Link>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm animate-fade-in-up ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-error-container text-on-error-container'}`}>
          {message}
        </div>
      )}

      {/* Add New Slots */}
      <section className="bg-surface-container-low rounded-[2rem] p-8">
        <h2 className="text-xl font-bold text-on-surface mb-6">Add Available Slots</h2>
        <form onSubmit={addSlots} className="space-y-4">
          {newSlots.map((slot, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-4 rounded-2xl">
              <input
                type="date"
                className="flex-1 min-w-[150px] px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest"
                value={slot.date}
                onChange={(e) => updateSlot(idx, 'date', e.target.value)}
                required
              />
              <select
                className="w-36 px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest"
                value={slot.startTime}
                onChange={(e) => updateSlot(idx, 'startTime', e.target.value)}
                required
              >
                <option value="">Start Time</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <span className="text-on-surface-variant">-</span>
              <select
                className="w-36 px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest"
                value={slot.endTime}
                onChange={(e) => updateSlot(idx, 'endTime', e.target.value)}
                required
              >
                <option value="">End Time</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {newSlots.length > 1 && (
                <button type="button" onClick={() => removeSlotRow(idx)} className="p-3 text-error hover:bg-error-container rounded-xl transition-colors">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={addSlotRow} className="flex-1 px-6 py-3 bg-surface-container-high text-on-surface rounded-xl font-bold hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add</span>
              Add More Slots
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-container transition-all shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Slots'
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Current Available Slots */}
      <section className="bg-surface-container-low rounded-[2rem] p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-on-surface">Current Available Slots</h2>
          <span className="bg-primary-fixed text-on-primary-fixed text-xs font-bold px-3 py-1 rounded-full">
            {slots.length} Slots
          </span>
        </div>
        
        {slots.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-lowest rounded-2xl">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">event_busy</span>
            <p className="text-on-surface-variant">No available slots</p>
            <p className="text-on-surface-variant/60 text-sm mt-1">Add slots above to start accepting appointments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {slots.map((slot) => (
              <div key={slot._id} className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm group hover:ring-2 hover:ring-primary/20 transition-all">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-on-surface">{formatDate(slot.date)}</span>
                  <button onClick={() => removeSlot(slot._id)} className="p-1 text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-primary">{slot.startTime}</span>
                  <span className="text-on-surface-variant">-</span>
                  <span className="text-lg font-black text-primary">{slot.endTime}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default DoctorSlots
