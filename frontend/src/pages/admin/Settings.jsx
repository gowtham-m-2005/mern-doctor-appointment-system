import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useBrandingStore } from '../../store/brandingStore'
import { Settings, Percent, Type, Image, Mail, Save } from 'lucide-react'
import ThemePicker from '../../components/ThemePicker'

const getLogoUrl = (appLogo) => {
  if (!appLogo || appLogo === '') return null
  if (appLogo.startsWith('http')) return appLogo
  return appLogo.startsWith('/') ? appLogo : `/${appLogo}`
}

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    commissionPercent: 10,
    appName: 'DocBook',
    appLogo: '',
    contactEmail: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const { updateBranding } = useBrandingStore()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings')
      setSettings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('commissionPercent', settings.commissionPercent)
      formData.append('appName', settings.appName)
      formData.append('contactEmail', settings.contactEmail)
      if (logoFile) formData.append('appLogo', logoFile)

      const { data } = await api.put('/admin/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMessage('Settings saved successfully')
      setLogoFile(null)
      // Update settings from response and refresh branding
      setSettings(data)
      updateBranding(data)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="space-y-4 animate-pulse"><div className="card h-32" /><div className="card h-48" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
        <p className="text-on-surface-variant">Configure application settings</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm animate-fade-in-up ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <form onSubmit={saveSettings} className="space-y-6">
        <div className="card animate-scale-in stagger-1">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Commission Settings
          </h2>
          <div>
            <label className="label">Commission Percentage (%)</label>
            <input
              type="number"
              className="input w-48"
              value={settings.commissionPercent}
              onChange={(e) => setSettings({ ...settings, commissionPercent: e.target.value })}
              min="0"
              max="100"
              required
            />
            <p className="text-sm text-on-surface-variant mt-1">
              This percentage will be added to doctor's fee as platform commission
            </p>
          </div>
        </div>

        <div className="card animate-scale-in stagger-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Type className="w-5 h-5" />
            Branding
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">App Name</label>
              <input
                type="text"
                className="input"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">App Logo</label>
              {console.log('Settings appLogo:', settings.appLogo, 'URL:', getLogoUrl(settings.appLogo))}
              <div className="flex items-center gap-4">
                {settings.appLogo && (
                  <img 
                    src={getLogoUrl(settings.appLogo)} 
                    alt="Logo" 
                    className="w-16 h-16 object-contain rounded-lg border"
                    onError={(e) => {
                      console.error('Settings logo failed to load:', getLogoUrl(settings.appLogo))
                      e.target.style.display = 'none'
                    }}
                  />
                )}
                <input
                  type="file"
                  className="input flex-1"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                />
              </div>
              {logoFile && <p className="text-sm text-green-600 mt-1">Selected: {logoFile.name}</p>}
            </div>
          </div>
        </div>

        <div className="card animate-scale-in stagger-3">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Theme Settings
          </h2>
          <ThemePicker isAdmin={true} />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </h2>
          <div>
            <label className="label">Contact Email</label>
            <input
              type="email"
              className="input"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              placeholder="support@docbook.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-8"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}

export default AdminSettings
