const Appointment = require("../models/Appointment.model");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const { bookAppointment, cancelAppointment, rescheduleAppointment } = require("../services/appointmentService");

exports.getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate("user", "name email")
    .populate({ path: "doctor", populate: { path: "user", select: "name" } })
    .sort({ "slot.date": 1, "slot.startTime": 1 });
  res.json(appointments);
});

exports.rescheduleAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newSlot, confirmed } = req.body;
  const userId = req.user._id;

  const result = await rescheduleAppointment(id, userId, newSlot, confirmed);
  if (confirmed && result.needsConfirmation !== undefined) {
    return res.status(400).json({ message: "Selected slot not available", needsConfirmation: true });
  }
  res.json(result);
});

exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id)
    .populate("user", "name email phone")
    .populate({ path: "doctor", populate: { path: "user", select: "name email phone" } });
  if (!appt) return res.status(404).json({ message: "Not found" });
  res.json(appt);
});
