const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/appointment.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", auth, ctrl.getAllAppointments);
router.get("/:id", auth, ctrl.getAppointmentById);
router.put("/:id/reschedule", auth, ctrl.rescheduleAppointment);

module.exports = router;
