const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/auth.controller");
const { upload } = require("../middleware/upload.middleware");
const validate = require("../middleware/validation.middleware");
const { registerSchema, loginSchema, doctorRegisterSchema } = require("../utils/validationSchemas");

router.post("/register", validate(registerSchema), ctrl.register);
router.post("/login", validate(loginSchema), ctrl.login);
router.post("/register-doctor", upload.single("certificate"), validate(doctorRegisterSchema), ctrl.registerDoctor);

module.exports = router;
