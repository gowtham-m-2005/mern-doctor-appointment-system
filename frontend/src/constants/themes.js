/**
 * Pre-built Professional Themes (Light Mode Only)
 * WCAG AA compliant for accessibility
 */

export const themes = {
  default_blue: {
    name: 'Default Blue',
    description: 'Professional medical blue theme',
    primary: '#0066CC',
    'primary-container': '#D1E4FF',
    'on-primary': '#FFFFFF',
    secondary: '#535F70',
    'secondary-container': '#D7E3F7',
    'on-secondary': '#FFFFFF',
    surface: '#FEF7FF',
    'surface-container': '#F3F3F3',
    'on-surface': '#1B1B1F',
    'on-surface-variant': '#000000',
    outline: '#74777F',
    background: '#FFFFFF',
    'on-background': '#1B1B1F',
    error: '#BA1A1A',
    'on-error': '#FFFFFF',
    'error-container': '#FFDAD6',
    'on-error-container': '#410002',
  },
  medical_teal: {
    name: 'Medical Teal',
    description: 'Calming teal healthcare theme',
    primary: '#006A6A',
    'primary-container': '#74F7F7',
    'on-primary': '#FFFFFF',
    secondary: '#4A6363',
    'secondary-container': '#CCE8E7',
    'on-secondary': '#FFFFFF',
    surface: '#FAFDFC',
    'surface-container': '#F4F4F4',
    'on-surface': '#191C1C',
    'on-surface-variant': '#000000',
    outline: '#6F7979',
    background: '#FAFDFC',
    'on-background': '#191C1C',
    error: '#BA1A1A',
    'on-error': '#FFFFFF',
    'error-container': '#FFDAD6',
    'on-error-container': '#410002',
  },
  professional_purple: {
    name: 'Professional Purple',
    description: 'Trustworthy purple theme',
    primary: '#6750A4',
    'primary-container': '#EADDFF',
    'on-primary': '#FFFFFF',
    secondary: '#625B71',
    'secondary-container': '#E8DEF8',
    'on-secondary': '#FFFFFF',
    surface: '#FEF7FF',
    'surface-container': '#F3F3F3',
    'on-surface': '#1D1B20',
    'on-surface-variant': '#000000',
    outline: '#79747E',
    background: '#FEF7FF',
    'on-background': '#1D1B20',
    error: '#BA1A1A',
    'on-error': '#FFFFFF',
    'error-container': '#FFDAD6',
    'on-error-container': '#410002',
  },
  nature_green: {
    name: 'Nature Green',
    description: 'Healing green wellness theme',
    primary: '#2E7D32',
    'primary-container': '#B9F6CA',
    'on-primary': '#FFFFFF',
    secondary: '#546E7A',
    'secondary-container': '#DCE4E8',
    'on-secondary': '#FFFFFF',
    surface: '#F5FBF5',
    'surface-container': '#F1F1F1',
    'on-surface': '#1B1B1F',
    'on-surface-variant': '#000000',
    outline: '#72777F',
    background: '#F5FBF5',
    'on-background': '#1B1B1F',
    error: '#BA1A1A',
    'on-error': '#FFFFFF',
    'error-container': '#FFDAD6',
    'on-error-container': '#410002',
  },
  warm_orange: {
    name: 'Warm Orange',
    description: 'Friendly approachable theme',
    primary: '#E65100',
    'primary-container': '#FFCCBC',
    'on-primary': '#FFFFFF',
    secondary: '#5D4037',
    'secondary-container': '#D7CCC8',
    'on-secondary': '#FFFFFF',
    surface: '#FFF8F5',
    'surface-container': '#F3F3F3',
    'on-surface': '#1B1B1F',
    'on-surface-variant': '#000000',
    outline: '#777777',
    background: '#FFF8F5',
    'on-background': '#1B1B1F',
    error: '#BA1A1A',
    'on-error': '#FFFFFF',
    'error-container': '#FFDAD6',
    'on-error-container': '#410002',
  },
  modern_gray: {
    name: 'Modern Gray',
    description: 'Minimalist clean theme',
    primary: '#424242',
    'primary-container': '#E0E0E0',
    'on-primary': '#FFFFFF',
    secondary: '#616161',
    'secondary-container': '#E8E8E8',
    'on-secondary': '#FFFFFF',
    surface: '#FAFAFA',
    'surface-container': '#F5F5F5',
    'on-surface': '#1B1B1F',
    'on-surface-variant': '#000000',
    outline: '#757575',
    background: '#FAFAFA',
    'on-background': '#1B1B1F',
    error: '#BA1A1A',
    'on-error': '#FFFFFF',
    'error-container': '#FFDAD6',
    'on-error-container': '#410002',
  },
};

/**
 * Get theme by ID
 */
export const getTheme = (themeId) => {
  return themes[themeId] || themes.default_blue;
};

/**
 * Get all themes
 */
export const getAllThemes = () => {
  return Object.entries(themes).map(([id, theme]) => ({
    id,
    ...theme,
  }));
};

/**
 * Apply theme colors to CSS variables
 */
export const applyTheme = (themeId) => {
  const theme = getTheme(themeId);
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
};
