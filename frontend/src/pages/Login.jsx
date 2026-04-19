import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useBrandingStore } from '../store/brandingStore'
import api from '../api/axios'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

const getLogoUrl = (appLogo) => {
  if (!appLogo) return null
  if (appLogo.startsWith('http')) return appLogo
  // Backend serves uploads at root path - ensure leading slash
  return appLogo.startsWith('/') ? appLogo : `/${appLogo}`
}

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
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
      const { data } = await api.post('/auth/login', form)
      login(data)
      if (data.user.role === 'admin') navigate('/admin')
      else if (data.user.role === 'doctor') navigate('/doctor')
      else navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-fixed to-surface p-4 animate-fade-in">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-fixed rounded-2xl mb-4 animate-scale-in hover:scale-110 transition-transform duration-300">
            {appLogo ? (
              <img src={getLogoUrl(appLogo)} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <span className="material-symbols-outlined text-4xl text-on-primary-fixed-variant">medical_services</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-on-surface animate-fade-in-up stagger-1">Welcome back</h1>
          <p className="text-on-surface-variant mt-1 animate-fade-in-up stagger-2">Sign in to your {appName} account</p>
        </div>

        <div className="card animate-scale-in stagger-3">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
            <p className="mt-2 text-on-surface-variant">
              Are you a doctor?{' '}
              <Link to="/register-doctor" className="text-primary hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
