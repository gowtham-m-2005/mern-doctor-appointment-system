const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/theme.controller");
const auth = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

// Public endpoint - get available themes
router.get("/list", ctrl.getThemes);

// Get current theme settings (auth required)
router.get("/settings", auth, ctrl.getThemeSettings);

// Update theme settings (admin only)
router.put("/settings", auth, requireRole("admin"), ctrl.updateThemeSettings);

module.exports = router;
