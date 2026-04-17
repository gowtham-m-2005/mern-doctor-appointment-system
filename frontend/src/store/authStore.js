import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      doctor: null,
      token: null,
      isAuthenticated: false,

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
        })
        localStorage.removeItem('auth-storage')
      },

      updateUser: (updates) => {
        set({ user: { ...get().user, ...updates } })
      },

      updateDoctor: (updates) => {
        set({ doctor: { ...get().doctor, ...updates } })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
