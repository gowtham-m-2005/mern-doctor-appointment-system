import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useBrandingStore } from '../store/brandingStore'
import api from '../api/axios'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'

const getLogoUrl = (appLogo) => {
  if (!appLogo) return null
  if (appLogo.startsWith('http')) return appLogo
  // Backend serves uploads at root path - ensure leading slash
  return appLogo.startsWith('/') ? appLogo : `/${appLogo}`
}

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
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
    try {
      const { data } = await api.post('/auth/register', form)
      login(data)
      navigate('/dashboard')
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed'
      const errors = err.response?.data?.errors
      if (errors && Array.isArray(errors)) {
        setError(`${errorMessage}: ${errors.join(', ')}`)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4 animate-fade-in">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4 animate-scale-in hover:scale-110 transition-transform duration-300">
            {appLogo ? (
              <img src={getLogoUrl(appLogo)} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <span className="material-symbols-outlined text-4xl text-primary-600">medical_services</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-on-surface animate-fade-in-up stagger-1">Create account</h1>
          <p className="text-on-surface-variant mt-1 animate-fade-in-up stagger-2">Sign up as a patient on {appName}</p>
        </div>

        <div className="card animate-scale-in stagger-3">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="John Doe"
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
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
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
              <p className="text-xs text-on-surface-variant mt-1">Must contain 8+ characters, uppercase, lowercase, number, and special character (@$!%*?&)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-on-surface-variant">
              Are you a doctor?{' '}
              <Link to="/register-doctor" className="text-primary-600 hover:underline font-medium">
                Register as Doctor
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
