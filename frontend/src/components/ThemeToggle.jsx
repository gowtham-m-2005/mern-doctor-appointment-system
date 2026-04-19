import { useAuthStore } from '../store/authStore';

const ThemeToggle = () => {
  const { mode, setMode } = useAuthStore();

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded-lg hover:bg-surface-container-low transition-colors"
      title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="material-symbols-outlined text-on-surface">
        {mode === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
