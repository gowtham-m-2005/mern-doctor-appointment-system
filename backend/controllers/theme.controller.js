const Settings = require("../models/Settings.model");
const { getAllThemes, getTheme } = require("../constants/themes");

/**
 * Get all available themes
 */
exports.getThemes = (req, res) => {
  try {
    const themes = getAllThemes();
    res.json(themes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get current system theme settings
 */
exports.getThemeSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      defaultTheme: settings.defaultTheme,
      allowUserThemeOverride: settings.allowUserThemeOverride,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update system theme settings (Admin only)
 */
exports.updateThemeSettings = async (req, res) => {
  try {
    const { defaultTheme, allowUserThemeOverride } = req.body;

    // Validate theme ID
    const availableThemes = getAllThemes();
    const themeExists = availableThemes.some(theme => theme.id === defaultTheme);
    
    if (!themeExists) {
      return res.status(400).json({ message: "Invalid theme ID" });
    }

    const settings = await Settings.getSettings();
    settings.defaultTheme = defaultTheme;
    if (allowUserThemeOverride !== undefined) {
      settings.allowUserThemeOverride = allowUserThemeOverride;
    }
    await settings.save();

    res.json({
      defaultTheme: settings.defaultTheme,
      allowUserThemeOverride: settings.allowUserThemeOverride,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
