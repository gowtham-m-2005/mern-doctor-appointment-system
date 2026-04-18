import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const DarkModeToggle = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-surface-container-low hover:bg-surface-container-high dark:bg-surface-container-high dark:hover:bg-surface-container transition-all duration-300 shadow-sm hover:shadow-md group"
      aria-label="Toggle dark mode"
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <Sun 
          className={`absolute inset-0 w-5 h-5 text-primary transition-transform duration-500 ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 text-primary transition-transform duration-500 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  )
}

export default DarkModeToggle
