import { create } from 'zustand'
import api from '../api/axios'

export const useBrandingStore = create((set, get) => ({
  appName: 'DocBook',
  appLogo: '',
  contactEmail: '',
  commissionPercent: 10,
  loading: true,

  fetchBranding: async () => {
    try {
      // Use public branding endpoint that doesn't require auth
      const { data } = await api.get('/branding')
      const appName = data.appName || 'DocBook'
      document.title = `${appName} - Doctor Appointment System`
      set({
        appName: appName,
        appLogo: data.appLogo || '',
        contactEmail: data.contactEmail || '',
        commissionPercent: data.commissionPercent || 10,
        loading: false,
      })
    } catch (err) {
      console.error('Failed to fetch branding:', err)
      set({ loading: false })
    }
  },

  updateBranding: (settings) => {
    const appName = settings.appName || get().appName
    document.title = `${appName} - Doctor Appointment System`
    set({
      appName: appName,
      appLogo: settings.appLogo || get().appLogo,
      contactEmail: settings.contactEmail || get().contactEmail,
      commissionPercent: settings.commissionPercent || get().commissionPercent,
    })
  },
}))
