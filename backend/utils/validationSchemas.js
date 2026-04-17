const Joi = require('joi');

// User registration schema
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message('Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character')
    .required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).allow(''),
  role: Joi.string().valid('user', 'doctor').default('user'),
});

// Login schema
const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

// Doctor registration schema
const doctorRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message('Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character')
    .required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  specialization: Joi.string().min(2).max(50).trim().required(),
  qualification: Joi.string().min(2).max(50).trim().required(),
  experience: Joi.number().min(0).max(50).required(),
  fee: Joi.number().min(0).required(),
  certificate: Joi.string().allow(''),
  bio: Joi.string().max(500).allow(''),
  address: Joi.string().max(200).allow(''),
});

// Appointment booking schema
const bookAppointmentSchema = Joi.object({
  doctorId: Joi.string().required(),
  slot: Joi.object({
    date: Joi.string().isoDate().required(),
    startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  }).required(),
});

// Reschedule appointment schema
const rescheduleSchema = Joi.object({
  newSlot: Joi.object({
    date: Joi.string().isoDate().required(),
    startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  }).required(),
  confirmed: Joi.boolean().default(false),
});

// Prescription schema
const prescriptionSchema = Joi.object({
  appointmentId: Joi.string().required(),
  notes: Joi.string().max(1000).allow(''),
  medicines: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).max(100).required(),
      dosage: Joi.string().max(50).allow(''),
      duration: Joi.string().max(50).allow(''),
    })
  ).min(0),
});

// Doctor profile update schema
const doctorProfileSchema = Joi.object({
  specialization: Joi.string().min(2).max(50).trim(),
  qualification: Joi.string().min(2).max(50).trim(),
  experience: Joi.number().min(0).max(50),
  fee: Joi.number().min(0),
  bio: Joi.string().max(500).allow(''),
  address: Joi.string().max(200).allow(''),
});

// User profile update schema
const userProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).allow(''),
});

// Add slots schema
const addSlotsSchema = Joi.object({
  slots: Joi.array().items(
    Joi.object({
      date: Joi.string().isoDate().required(),
      startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    })
  ).min(1).max(50).required(),
});

// Admin settings schema
const adminSettingsSchema = Joi.object({
  commissionPercent: Joi.number().min(0).max(100),
  appName: Joi.string().min(2).max(50),
  contactEmail: Joi.string().email().allow(''),
});

// Doctor approval schema
const doctorApprovalSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  doctorRegisterSchema,
  bookAppointmentSchema,
  rescheduleSchema,
  prescriptionSchema,
  doctorProfileSchema,
  userProfileSchema,
  addSlotsSchema,
  adminSettingsSchema,
  doctorApprovalSchema,
};
