const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/appointment.controller");
const auth = require("../middleware/auth.middleware");
const { auditPHIAccess } = require("../middleware/auditLogger.middleware");

// HIPAA Compliant: Audit logging for PHI (appointments contain protected health information)
router.get("/", auth, auditPHIAccess('appointment'), ctrl.getAllAppointments);
router.get("/:id", auth, auditPHIAccess('appointment'), ctrl.getAppointmentById);
router.put("/:id/reschedule", auth, auditPHIAccess('appointment'), ctrl.rescheduleAppointment);

module.exports = router;
