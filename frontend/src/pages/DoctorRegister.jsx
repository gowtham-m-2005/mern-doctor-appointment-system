import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useBrandingStore } from '../store/brandingStore'
import api from '../api/axios'
import { Eye, EyeOff, Mail, Lock, User, Phone, Upload, GraduationCap, DollarSign, FileText } from 'lucide-react'

const getLogoUrl = (appLogo) => {
  if (!appLogo) return null
  if (appLogo.startsWith('http')) return appLogo
  // Backend serves uploads at root path - ensure leading slash
  return appLogo.startsWith('/') ? appLogo : `/${appLogo}`
}

const DoctorRegister = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    fee: '',
    bio: '',
    address: '',
  })
  const [certificate, setCertificate] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { appName, appLogo } = useBrandingStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    Object.keys(form).forEach((key) => formData.append(key, form[key]))
    if (certificate) formData.append('certificate', certificate)

    try {
      const { data } = await api.post('/auth/register-doctor', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      login(data)
      navigate('/doctor')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4 animate-fade-in">
      <div className="w-full max-w-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4 animate-scale-in hover:scale-110 transition-transform duration-300">
            {appLogo ? (
              <img src={getLogoUrl(appLogo)} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <span className="material-symbols-outlined text-4xl text-primary-600">medical_services</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-on-surface animate-fade-in-up stagger-1">Doctor Registration</h1>
          <p className="text-on-surface-variant mt-1 animate-fade-in-up stagger-2">Join {appName} network of healthcare professionals</p>
        </div>

        <div className="card animate-scale-in stagger-3">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Dr. John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="email"
                    className="input pl-10"
                    placeholder="doctor@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="tel"
                    className="input pl-10"
                    placeholder="+1234567890"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Specialization</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Cardiologist"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Qualification</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="MBBS, MD"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Experience (years)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="10"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="label">Consultation Fee (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="number"
                    className="input pl-10"
                    placeholder="100"
                    value={form.fee}
                    onChange={(e) => setForm({ ...form, fee: e.target.value })}
                    required
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Clinic Address</label>
              <input
                type="text"
                className="input"
                placeholder="123 Medical Center, City"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Bio</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  className="input pl-10 min-h-[100px]"
                  placeholder="Brief description about your practice..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Certificate (PDF/Image)</label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="file"
                  className="input pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCertificate(e.target.files[0])}
                />
              </div>
              {certificate && <p className="mt-1 text-sm text-green-600">Selected: {certificate.name}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorRegister
