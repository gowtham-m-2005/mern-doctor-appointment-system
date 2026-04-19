import { createContext, useContext, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { applyTheme } from '../constants/themes'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const { theme } = useAuthStore()

  useEffect(() => {
    // Apply the selected theme
    applyTheme(theme || 'default_blue')
  }, [theme])

  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  )
}
