import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'

const DoctorProfile = () => {
  const { doctor, updateDoctor, user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

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

  const availableSlots = profile?.availableSlots?.filter((s) => !s.isBooked) || []

  const updateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/doctor/profile', {
        specialization: profile.specialization,
        qualification: profile.qualification,
        experience: Number(profile.experience),
        fee: Number(profile.fee),
        virtualFee: Number(profile.virtualFee) || Number(profile.fee),
        inPersonFee: Number(profile.inPersonFee) || Math.round(Number(profile.fee) * 1.5),
        maxAppointmentsPerDay: Number(profile.maxAppointmentsPerDay) || 10,
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-on-surface-variant mt-4">Loading profile...</p>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-10 max-w-7xl mx-auto">
      {/* Mobile Header */}
      <div className="md:hidden animate-fade-in-down">
        <h1 className="text-2xl font-extrabold font-headline text-on-surface tracking-tight">Doctor Profile</h1>
        <p className="text-on-surface-variant mt-1 text-sm">Manage your profile and availability</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block animate-fade-in-down">
        <h1 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">Doctor Profile</h1>
        <p className="text-on-surface-variant mt-1">Manage your profile and availability</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm animate-fade-in-up ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-error-container text-on-error-container'}`}>
          {message}
        </div>
      )}

      {/* Hero Bento Grid Section */}
      <section className="grid grid-cols-12 gap-8">
        {/* Profile Identity Card */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 relative overflow-hidden shadow-[0_12px_32px_rgba(0,82,174,0.04)]">
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl ring-4 ring-primary-fixed bg-primary-fixed flex items-center justify-center text-primary text-4xl font-bold">
                {user?.name?.charAt(0) || 'D'}
              </div>
              <span className="absolute -bottom-2 -right-2 bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-on-primary tracking-widest uppercase">Verified</span>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">Dr. {user?.name || 'Doctor'}</h1>
                <p className="text-primary font-semibold text-lg">{profile?.specialization || 'Specialist'}</p>
              </div>
              <p className="text-on-surface-variant leading-relaxed max-w-2xl">
                {profile?.bio || 'Add your bio to tell patients about your expertise and experience.'}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="bg-surface-container-low px-4 py-1.5 rounded-full text-xs font-medium text-on-secondary-container">{profile?.qualification || 'MBBS'}</span>
                <span className="bg-surface-container-low px-4 py-1.5 rounded-full text-xs font-medium text-on-secondary-container">{profile?.experience || 0}+ Years Experience</span>
              </div>
            </div>
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        {/* Consultation & Fees Widget */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-primary p-8 rounded-[2rem] text-on-primary shadow-lg shadow-primary/20 flex flex-col justify-between h-full">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-70">Consultation Fees</span>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm">Standard Virtual</span>
                  <span className="text-3xl font-bold">₹{profile?.virtualFee || profile?.fee || 100}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm">In-Person Clinic</span>
                  <span className="text-3xl font-bold">₹{profile?.inPersonFee || (profile?.fee ? Math.round(profile.fee * 1.5) : 150)}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => document.getElementById('virtual-fee-input')?.focus()}
              className="mt-8 w-full bg-on-primary text-primary font-bold py-4 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">edit</span> Edit Rates
            </button>
          </div>
        </div>
      </section>

      {/* Profile Edit Form */}
      <div className="bg-surface-container-low rounded-[2rem] p-8">
        <h2 className="text-xl font-bold text-on-surface mb-6">Profile Information</h2>
        <form onSubmit={updateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Specialization</label>
              <input
                id="specialization-input"
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-container-lowest"
                value={profile?.specialization || ''}
                onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Experience (years)</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-container-lowest"
                value={profile?.experience || ''}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Qualification</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-container-lowest"
              value={profile?.qualification || ''}
              onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Virtual Consultation Fee (₹)</label>
            <input
              id="virtual-fee-input"
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-container-lowest"
              value={profile?.virtualFee || profile?.fee || ''}
              onChange={(e) => setProfile({ ...profile, virtualFee: e.target.value, fee: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">In-Person Clinic Fee (₹)</label>
            <input
              id="inperson-fee-input"
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-container-lowest"
              value={profile?.inPersonFee || (profile?.fee ? Math.round(profile.fee * 1.5) : '')}
              onChange={(e) => setProfile({ ...profile, inPersonFee: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Clinic Address</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-container-lowest"
              value={profile?.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Max Appointments Per Day</label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-container-lowest"
              value={profile?.maxAppointmentsPerDay || 10}
              onChange={(e) => setProfile({ ...profile, maxAppointmentsPerDay: e.target.value })}
              min="1"
              max="50"
              required
            />
            <p className="text-xs text-on-surface-variant mt-1">Maximum number of appointments you can accept per day (1-50)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Bio</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-container-lowest min-h-[120px]"
              value={profile?.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <button type="submit" disabled={saving} className="w-full bg-primary text-on-primary px-6 py-4 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-[0.98] shadow-md shadow-primary/10 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Quick Links */}
      <div className="flex gap-4">
        <Link to="/doctor/slots" className="flex-1 bg-surface-container-low p-6 rounded-2xl hover:bg-surface-container-high transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-wide">Slots</span>
          </div>
          <h4 className="font-bold text-on-surface">Manage Availability</h4>
          <p className="text-sm text-on-surface-variant mt-1">{availableSlots.length} slots available</p>
        </Link>
      </div>
    </div>
  )
}

export default DoctorProfile
