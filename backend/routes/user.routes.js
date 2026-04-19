const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");
const validate = require("../middleware/validation.middleware");
const { userProfileSchema, bookAppointmentSchema } = require("../utils/validationSchemas");
const { auditPHIAccess } = require("../middleware/auditLogger.middleware");

// HIPAA Compliant: Audit logging for PHI
router.get("/profile",                          auth, auditPHIAccess('user_profile'), ctrl.getProfile);
router.put("/profile",                          auth, upload.single("profilePic"), validate(userProfileSchema), auditPHIAccess('user_profile'), ctrl.updateProfile);
router.get("/doctors",                          auth, ctrl.getDoctors);
router.get("/doctors/:id/slots",                auth, ctrl.getDoctorSlots);
router.post("/appointments",                    auth, validate(bookAppointmentSchema), auditPHIAccess('appointment'), ctrl.bookAppointment);
router.get("/appointments",                     auth, auditPHIAccess('appointment'), ctrl.getMyAppointments);
router.put("/appointments/:id/cancel",          auth, auditPHIAccess('appointment'), ctrl.cancelAppointment);
router.get("/notifications",                    auth, ctrl.getMyNotifications);
router.put("/notifications/read-all",           auth, ctrl.markAllNotificationsRead);
router.put("/notifications/:id/read",           auth, ctrl.markNotificationRead);
router.get("/prescriptions",                    auth, auditPHIAccess('prescription'), ctrl.getMyPrescriptions);

module.exports = router;
