const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/doctor.controller");
const auth = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { upload } = require("../middleware/upload.middleware");
const validate = require("../middleware/validation.middleware");
const { doctorProfileSchema, addSlotsSchema, prescriptionSchema } = require("../utils/validationSchemas");

router.get("/profile", auth, requireRole("doctor"), ctrl.getMyProfile);
router.put("/profile", auth, requireRole("doctor"), upload.single("certificate"), validate(doctorProfileSchema), ctrl.updateProfile);
router.post("/slots", auth, requireRole("doctor"), validate(addSlotsSchema), ctrl.addSlots);
router.delete("/slots/:slotId", auth, requireRole("doctor"), ctrl.removeSlot);
router.get("/appointments", auth, requireRole("doctor"), ctrl.getMyAppointments);
router.post("/prescription", auth, requireRole("doctor"), validate(prescriptionSchema), ctrl.addPrescription);
router.put("/appointments/:id/confirm", auth, requireRole("doctor"), ctrl.confirmAppointment);
router.put("/appointments/:id/complete", auth, requireRole("doctor"), ctrl.completeAppointment);
router.get("/dashboard", auth, requireRole("doctor"), ctrl.getDashboardStats);

module.exports = router;
