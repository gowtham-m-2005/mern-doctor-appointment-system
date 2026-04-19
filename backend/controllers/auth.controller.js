const User = require("../models/User.model");
const Doctor = require("../models/Doctor.model");
const jwt = require("jsonwebtoken");
const { validatePasswordStrength } = require("../utils/passwordValidator");
const { logAuthEvent } = require("../middleware/securityLogger.middleware");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    // HIPAA Compliant: Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors 
      });
    }
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, phone, role: role || "user" });
    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      logAuthEvent('FAILED_LOGIN', req, { email, reason: 'Invalid credentials' });
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isActive) {
      logAuthEvent('FAILED_LOGIN', req, { email, reason: 'Account disabled' });
      return res.status(403).json({ message: "Account disabled" });
    }

    logAuthEvent('SUCCESS_LOGIN', req, { email, userId: user._id });

    let doctorData = null;
    if (user.role === "doctor") {
      doctorData = await Doctor.findOne({ user: user._id });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePic: user.profilePic },
      doctor: doctorData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, qualification, experience, fee, bio, address } = req.body;
    
    // HIPAA Compliant: Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors 
      });
    }
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, phone, role: "doctor" });
    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      qualification,
      experience,
      fee,
      bio,
      address,
      certificate: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name, email, role: "doctor" }, doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
