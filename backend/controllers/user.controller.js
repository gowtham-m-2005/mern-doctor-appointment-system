const User = require("../models/User.model");
const Doctor = require("../models/Doctor.model");
const Appointment = require("../models/Appointment.model");
const Notification = require("../models/Notification.model");
const Settings = require("../models/Settings.model");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const { getCache, setCache, deleteCache, CacheTTL, CacheKeys } = require("../utils/cache");
const { bookAppointment, cancelAppointment } = require("../services/appointmentService");

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  delete updates.password;
  delete updates.role;
  if (req.file) updates.profilePic = `/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
  res.json(user);
});

exports.getDoctors = asyncHandler(async (req, res) => {
  const { specialization, search } = req.query;
  const filter = { isApproved: "approved" };
  if (specialization) filter.specialization = new RegExp(specialization, "i");

  const doctors = await Doctor.find(filter).populate("user", "name email phone profilePic");
  const settings = await Settings.getSettings();

  let result = doctors.map((d) => ({
    ...d.toObject(),
    totalFee: Math.round((d.fee + (d.fee * settings.commissionPercent) / 100) * 100) / 100,
  }));

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (d) =>
        d.user?.name?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

exports.getDoctorSlots = asyncHandler(async (req, res) => {
  const doctorId = req.params.id;
  
  const cached = await getCache(CacheKeys.doctorSlots(doctorId));
  if (cached) {
    return res.json(cached);
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });

  const today = new Date().toISOString().split("T")[0];
  const available = doctor.availableSlots.filter(
    (s) => !s.isBooked && s.date >= today
  );
  
  await setCache(CacheKeys.doctorSlots(doctorId), available, CacheTTL.AVAILABLE_SLOTS);
  
  res.json(available);
});

exports.bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, slot } = req.body;
  const userId = req.user._id;

  const appointment = await bookAppointment(userId, doctorId, slot);
  res.status(201).json(appointment);
});

exports.getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate({
      path: "doctor",
      populate: { path: "user", select: "name email phone profilePic" },
    })
    .sort({ "slot.date": 1, "slot.startTime": 1 });
  res.json(appointments);
});

exports.cancelAppointment = asyncHandler(async (req, res) => {
  const result = await cancelAppointment(req.params.id, req.user._id);
  res.json(result);
});

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true }
  );
  res.json({ message: "Marked as read" });
});

exports.markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: "All notifications marked as read" });
});

exports.getMyPrescriptions = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    user: req.user._id,
    status: "completed",
    "prescription.notes": { $ne: "" },
  })
    .populate({
      path: "doctor",
      populate: { path: "user", select: "name email phone" },
    })
    .sort({ "slot.date": 1, "slot.startTime": 1 });

  const prescriptions = appointments.map((appt) => ({
    appointmentId: appt._id,
    doctorName: appt.doctor?.user?.name,
    doctorSpecialization: appt.doctor?.specialization,
    appointmentDate: appt.slot.date,
    appointmentTime: appt.slot.startTime,
    prescription: appt.prescription,
  }));

  res.json(prescriptions);
});
