import { useAuthStore } from '../store/authStore';
import { getAllThemes, applyTheme } from '../constants/themes';
import ThemeToggle from './ThemeToggle';

const UserThemePicker = () => {
  const { theme, mode, setTheme, setMode } = useAuthStore();
  const themes = getAllThemes();

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    applyTheme(themeId, mode);
  };

  const handleModeToggle = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    applyTheme(theme, newMode);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-on-surface mb-3">Choose Theme</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => handleThemeChange(themeOption.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === themeOption.id
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-outline-variant hover:border-outline'
              }`}
            >
              <div className="space-y-2">
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: themeOption.light.primary }}
                    title="Primary (Light)"
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: themeOption.light.secondary }}
                    title="Secondary (Light)"
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: themeOption.light.surface }}
                    title="Surface (Light)"
                  />
                </div>
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: themeOption.dark.primary }}
                    title="Primary (Dark)"
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: themeOption.dark.secondary }}
                    title="Secondary (Dark)"
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: themeOption.dark.surface }}
                    title="Surface (Dark)"
                  />
                </div>
                <p className="text-sm font-semibold text-on-surface">{themeOption.name}</p>
                <p className="text-xs text-on-surface-variant">{themeOption.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
        <div>
          <p className="text-sm font-semibold text-on-surface">Dark Mode</p>
          <p className="text-xs text-on-surface-variant">Switch between light and dark mode</p>
        </div>
        <button
          onClick={handleModeToggle}
          className="p-2 rounded-lg hover:bg-surface-container-low transition-colors"
          title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        >
          <span className="material-symbols-outlined text-on-surface">
            {mode === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default UserThemePicker;
