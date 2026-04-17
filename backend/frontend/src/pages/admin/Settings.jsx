import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Settings, Percent, Type, Image, Mail, Save } from 'lucide-react'

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

      await api.put('/admin/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMessage('Settings saved successfully')
      setLogoFile(null)
      fetchSettings()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center py-8">Loading...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Configure application settings</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <form onSubmit={saveSettings} className="space-y-6">
        <div className="card">
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
            <p className="text-sm text-gray-500 mt-1">
              This percentage will be added to doctor's fee as platform commission
            </p>
          </div>
        </div>

        <div className="card">
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
              <div className="flex items-center gap-4">
                {settings.appLogo && (
                  <img src={settings.appLogo} alt="Logo" className="w-16 h-16 object-contain rounded-lg border" />
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
