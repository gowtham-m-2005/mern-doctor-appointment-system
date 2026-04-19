const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.controller");
const auth = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { upload } = require("../middleware/upload.middleware");
const validate = require("../middleware/validation.middleware");
const { adminSettingsSchema, doctorApprovalSchema } = require("../utils/validationSchemas");

router.get("/doctors/pending",     auth, requireRole("admin"), ctrl.getPendingDoctors);
router.get("/doctors/all",         auth, requireRole("admin"), ctrl.getAllDoctors);
router.put("/doctors/:id/approve", auth, requireRole("admin"), validate(doctorApprovalSchema), ctrl.approveDoctor);
router.delete("/doctors/:id",      auth, requireRole("admin"), ctrl.deleteDoctor);
router.get("/users",               auth, requireRole("admin"), ctrl.getAllUsers);
router.put("/users/:id/toggle",    auth, requireRole("admin"), ctrl.toggleUserStatus);
router.delete("/users/:id",        auth, requireRole("admin"), ctrl.deleteUser);
router.get("/appointments",        auth, requireRole("admin"), ctrl.getAllAppointments);
router.get("/dashboard",           auth, requireRole("admin"), ctrl.getDashboardStats);
router.get("/settings",            auth, requireRole("admin"), ctrl.getSettings);
router.put("/settings",            auth, requireRole("admin"), upload.single("appLogo"), validate(adminSettingsSchema), ctrl.updateSettings);

module.exports = router;
