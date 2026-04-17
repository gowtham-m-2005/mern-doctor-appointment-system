import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import { Plus, Trash2, Calendar, Clock, CheckCircle, X } from 'lucide-react'

const DoctorProfile = () => {
  const { doctor, updateDoctor, user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [newSlots, setNewSlots] = useState([{ date: '', startTime: '', endTime: '' }])

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/doctor/profile')
      setProfile(data)
      updateDoctor(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/doctor/profile', {
        specialization: profile.specialization,
        qualification: profile.qualification,
        experience: profile.experience,
        fee: profile.fee,
        bio: profile.bio,
        address: profile.address,
      })
      setMessage('Profile updated successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const addSlots = async (e) => {
    e.preventDefault()
    const validSlots = newSlots.filter((s) => s.date && s.startTime && s.endTime)
    if (validSlots.length === 0) return

    try {
      await api.post('/doctor/slots', { slots: validSlots })
      setNewSlots([{ date: '', startTime: '', endTime: '' }])
      fetchProfile()
      setMessage('Slots added successfully')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add slots')
    }
  }

  const removeSlot = async (slotId) => {
    try {
      await api.delete(`/doctor/slots/${slotId}`)
      fetchProfile()
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

  if (loading) return <p className="text-center py-8">Loading...</p>

  const availableSlots = profile?.availableSlots?.filter((s) => !s.isBooked) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Profile</h1>
        <p className="text-gray-500">Manage your profile and availability</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Specialization</label>
                <input
                  type="text"
                  className="input"
                  value={profile?.specialization || ''}
                  onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Experience (years)</label>
                <input
                  type="number"
                  className="input"
                  value={profile?.experience || ''}
                  onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Qualification</label>
              <input
                type="text"
                className="input"
                value={profile?.qualification || ''}
                onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Consultation Fee ($)</label>
              <input
                type="number"
                className="input"
                value={profile?.fee || ''}
                onChange={(e) => setProfile({ ...profile, fee: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Clinic Address</label>
              <input
                type="text"
                className="input"
                value={profile?.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Bio</label>
              <textarea
                className="input min-h-[100px]"
                value={profile?.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>

            <button type="submit" disabled={saving} className="w-full btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Add Available Slots
            </h2>
            <form onSubmit={addSlots} className="space-y-3">
              {newSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="date"
                    className="input flex-1"
                    value={slot.date}
                    onChange={(e) => updateSlot(idx, 'date', e.target.value)}
                    required
                  />
                  <input
                    type="time"
                    className="input w-28"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(idx, 'startTime', e.target.value)}
                    required
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="time"
                    className="input w-28"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(idx, 'endTime', e.target.value)}
                    required
                  />
                  {newSlots.length > 1 && (
                    <button type="button" onClick={() => removeSlotRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <button type="button" onClick={addSlotRow} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add More
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Save Slots
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Current Available Slots</h2>
            {availableSlots.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No available slots</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableSlots.map((slot) => (
                  <div key={slot._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{slot.date}</span>
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <button onClick={() => removeSlot(slot._id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
