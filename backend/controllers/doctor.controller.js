const Doctor = require("../models/Doctor.model");
const Appointment = require("../models/Appointment.model");
const User = require("../models/User.model");
const { createNotification } = require("../utils/notificationScheduler");

exports.getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "-password");
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.user;
    delete updates.isApproved;
    if (req.file) updates.certificate = `/uploads/${req.file.filename}`;

    // Validate required fields
    if (!updates.specialization || !updates.qualification || updates.experience === undefined || updates.fee === undefined) {
      return res.status(400).json({ message: "Missing required fields: specialization, qualification, experience, fee" });
    }

    const doctor = await Doctor.findOneAndUpdate({ user: req.user._id }, updates, { new: true });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    res.json(doctor);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.addSlots = async (req, res) => {
  try {
    const { slots } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.availableSlots.push(...slots);
    await doctor.save();
    res.json(doctor.availableSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const doctor = await Doctor.findOne({ user: req.user._id });
    doctor.availableSlots = doctor.availableSlots.filter((s) => s._id.toString() !== slotId);
    await doctor.save();
    res.json({ message: "Slot removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addPrescription = async (req, res) => {
  try {
    const { appointmentId, notes, medicines } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id });
    const appt = await Appointment.findOne({ _id: appointmentId, doctor: doctor._id });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    appt.prescription = { notes, medicines, addedAt: new Date() };
    await appt.save();

    await createNotification(appt.user, "Prescription Added", "Your doctor has added a prescription.", "general", appt._id);
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const appointments = await Appointment.find({ doctor: doctor._id });
    const today = new Date().toISOString().split("T")[0];

    const todayAppts = appointments.filter((a) => {
      const slotDate = new Date(a.slot.date).toISOString().split("T")[0];
      return slotDate === today;
    });
    const completed = appointments.filter((a) => a.status === "completed").length;
    const totalEarnings = appointments
      .filter((a) => a.status === "completed" || a.status === "confirmed")
      .reduce((sum, a) => sum + a.doctorFee, 0);

    // Calculate monthly growth percentage
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthCount = appointments.filter((a) => {
      const apptDate = new Date(a.slot.date);
      return apptDate.getMonth() === currentMonth && apptDate.getFullYear() === currentYear;
    }).length;

    const lastMonthCount = appointments.filter((a) => {
      const apptDate = new Date(a.slot.date);
      return apptDate.getMonth() === lastMonth && apptDate.getFullYear() === lastMonthYear;
    }).length;

    const growthPercent = lastMonthCount > 0
      ? (((currentMonthCount - lastMonthCount) / lastMonthCount) * 100).toFixed(1)
      : currentMonthCount > 0 ? 100 : 0;

    res.json({ total: appointments.length, today: todayAppts.length, completed, totalEarnings, growthPercent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.completeAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const appt = await Appointment.findOne({ _id: req.params.id, doctor: doctor._id });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.status !== "confirmed") {
      return res.status(400).json({ message: "Only confirmed appointments can be completed" });
    }

    appt.status = "completed";
    await appt.save();

    await createNotification(
      appt.user,
      "Appointment Completed",
      `Your appointment with Dr. ${doctor.user?.name || ""} has been completed.`,
      "general",
      appt._id
    );

    res.json({ message: "Appointment marked as completed", appointment: appt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.confirmAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const appt = await Appointment.findOne({ _id: req.params.id, doctor: doctor._id });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be confirmed" });
    }

    appt.status = "confirmed";
    await appt.save();

    // Notify patient that appointment is confirmed
    const formattedDate = new Date(appt.slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    await createNotification(
      appt.user,
      "Appointment Confirmed",
      `Your appointment for ${formattedDate} at ${appt.slot.startTime} has been confirmed by Dr. ${doctor.user?.name || ""}.`,
      "booking",
      appt._id
    );

    res.json({ message: "Appointment confirmed successfully", appointment: appt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
