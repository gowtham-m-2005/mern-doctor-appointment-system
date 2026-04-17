const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");
const validate = require("../middleware/validation.middleware");
const { userProfileSchema, bookAppointmentSchema } = require("../utils/validationSchemas");

router.get("/profile",                          auth, ctrl.getProfile);
router.put("/profile",                          auth, upload.single("profilePic"), validate(userProfileSchema), ctrl.updateProfile);
router.get("/doctors",                          auth, ctrl.getDoctors);
router.get("/doctors/:id/slots",                auth, ctrl.getDoctorSlots);
router.post("/appointments",                    auth, validate(bookAppointmentSchema), ctrl.bookAppointment);
router.get("/appointments",                     auth, ctrl.getMyAppointments);
router.put("/appointments/:id/cancel",          auth, ctrl.cancelAppointment);
router.get("/notifications",                    auth, ctrl.getMyNotifications);
router.put("/notifications/read-all",           auth, ctrl.markAllNotificationsRead);
router.put("/notifications/:id/read",           auth, ctrl.markNotificationRead);
router.get("/prescriptions",                    auth, ctrl.getMyPrescriptions);

module.exports = router;
