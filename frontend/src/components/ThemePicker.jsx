import { useState, useEffect } from 'react';
import { getAllThemes, applyTheme } from '../constants/themes';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

const ThemePicker = ({ isAdmin = false }) => {
  const [themes, setThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('default_blue');
  const [allowOverride, setAllowOverride] = useState(true);
  const [loading, setLoading] = useState(true);
  const { setTheme, theme: userTheme } = useAuthStore();

  useEffect(() => {
    loadThemes();
    if (isAdmin) {
      loadSettings();
    } else {
      setCurrentTheme(userTheme || 'default_blue');
      setLoading(false);
    }
  }, [isAdmin, userTheme]);

  const loadThemes = () => {
    const allThemes = getAllThemes();
    setThemes(allThemes);
  };

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/theme/settings');
      setCurrentTheme(data.defaultTheme);
      setAllowOverride(data.allowUserThemeOverride);
      applyTheme(data.defaultTheme);
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (themeId) => {
    setCurrentTheme(themeId);
    
    if (isAdmin) {
      try {
        await api.put('/theme/settings', {
          defaultTheme: themeId,
          allowUserThemeOverride: allowOverride,
        });
        applyTheme(themeId);
      } catch (error) {
        console.error('Failed to update theme:', error);
      }
    } else {
      setTheme(themeId);
      applyTheme(themeId);
    }
  };

  const handleOverrideChange = async (value) => {
    setAllowOverride(value);
    try {
      await api.put('/theme/settings', {
        defaultTheme: currentTheme,
        allowUserThemeOverride: value,
      });
    } catch (error) {
      console.error('Failed to update override setting:', error);
    }
  };

  if (loading && isAdmin) {
    return <div className="text-center py-4">Loading themes...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-on-surface mb-3">
          {isAdmin ? 'System Theme' : 'Choose Theme'}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                currentTheme === theme.id
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-outline-variant hover:border-outline'
              }`}
            >
              <div className="space-y-2">
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                    title="Primary"
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.secondary }}
                    title="Secondary"
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.surface }}
                    title="Surface"
                  />
                </div>
                <p className="text-sm font-semibold text-on-surface">{theme.name}</p>
                <p className="text-xs text-on-surface-variant">{theme.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
          <input
            type="checkbox"
            id="allowOverride"
            checked={allowOverride}
            onChange={(e) => handleOverrideChange(e.target.checked)}
            className="w-5 h-5 rounded border-2 border-outline text-primary focus:ring-primary"
          />
          <label htmlFor="allowOverride" className="text-sm text-on-surface">
            Allow users to override system theme
          </label>
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
