import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { applyTheme } from '../constants/themes'
import api from '../api/axios'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      doctor: null,
      token: null,
      isAuthenticated: false,
      theme: 'default_blue',

      fetchThemeSettings: async () => {
        try {
          const { data } = await api.get('/theme/settings')
          set({ theme: data.defaultTheme })
          applyTheme(data.defaultTheme)
        } catch (error) {
          console.error('Failed to fetch theme settings:', error)
          // Fallback to default theme
          applyTheme('default_blue')
        }
      },

      login: (data) => {
        set({
          user: data.user,
          doctor: data.doctor || null,
          token: data.token,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          user: null,
          doctor: null,
          token: null,
          isAuthenticated: false,
          theme: 'default_blue',
        })
        localStorage.removeItem('auth-storage')
      },

      updateUser: (updates) => {
        set({ user: { ...get().user, ...updates } })
      },

      updateDoctor: (updates) => {
        set({ doctor: { ...get().doctor, ...updates } })
      },

      setTheme: (themeId) => {
        set({ theme: themeId })
        applyTheme(themeId)
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.theme) {
          applyTheme(state.theme)
        }
      },
    }
  )
)
