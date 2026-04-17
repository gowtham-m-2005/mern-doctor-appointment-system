const User = require("../models/User.model");
const Doctor = require("../models/Doctor.model");
const Appointment = require("../models/Appointment.model");
const Notification = require("../models/Notification.model");
const Settings = require("../models/Settings.model");
const { calculateFee } = require("../utils/feeCalculator");
const { createNotification } = require("../utils/notificationScheduler");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;
    if (req.file) updates.profilePic = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctorSlots = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Only return future unbooked slots
    const today = new Date().toISOString().split("T")[0];
    const available = doctor.availableSlots.filter(
      (s) => !s.isBooked && s.date >= today
    );
    res.json(available);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, slot } = req.body;

    if (!doctorId || !slot?.date || !slot?.startTime) {
      return res.status(400).json({ message: "doctorId, slot.date and slot.startTime are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (doctor.isApproved !== "approved") {
      return res.status(400).json({ message: "This doctor is not accepting appointments" });
    }

    // Check user doesn't already have a confirmed booking with this doctor at the same slot
    const existing = await Appointment.findOne({
      user: req.user._id,
      doctor: doctorId,
      "slot.date": slot.date,
      "slot.startTime": slot.startTime,
      status: { $in: ["confirmed", "pending"] },
    });
    if (existing) {
      return res.status(400).json({ message: "You already have a booking for this slot" });
    }

    const slotIdx = doctor.availableSlots.findIndex(
      (s) => s.date === slot.date && s.startTime === slot.startTime && !s.isBooked
    );
    if (slotIdx === -1) return res.status(400).json({ message: "Slot not available" });

    doctor.availableSlots[slotIdx].isBooked = true;
    await doctor.save();

    const fees = await calculateFee(doctor.fee);
    const appointment = await Appointment.create({
      user: req.user._id,
      doctor: doctorId,
      slot: {
        date: slot.date,
        startTime: slot.startTime,
        endTime: doctor.availableSlots[slotIdx].endTime,
      },
      doctorFee: fees.doctorFee,
      commission: fees.commission,
      totalFee: fees.totalFee,
    });

    // Notify patient
    const formattedDate = new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    await createNotification(
      req.user._id,
      "Appointment Requested",
      `Your appointment request for ${formattedDate} at ${slot.startTime} is pending doctor confirmation.`,
      "booking",
      appointment._id
    );

    // Notify doctor
    await createNotification(
      doctor.user,
      "New Appointment Request",
      `${req.user.name} has requested an appointment for ${formattedDate} at ${slot.startTime}. Please confirm or cancel.`,
      "booking",
      appointment._id
    );

    const populated = await appointment.populate([
      { path: "user", select: "name email" },
      { path: "doctor", populate: { path: "user", select: "name" } },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email phone profilePic" },
      })
      .sort({ "slot.date": -1, "slot.startTime": -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.status === "cancelled") {
      return res.status(400).json({ message: "Appointment is already cancelled" });
    }
    if (appt.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel a completed appointment" });
    }

    const apptDateTime = new Date(`${appt.slot.date}T${appt.slot.startTime}`);
    const diffHours = (apptDateTime - new Date()) / (1000 * 60 * 60);
    if (diffHours < 24) {
      return res.status(400).json({ message: "Cannot cancel within 24 hours of appointment" });
    }

    appt.status = "cancelled";
    await appt.save();

    // Free up the slot
    const doctor = await Doctor.findById(appt.doctor);
    const cancelFormattedDate = new Date(appt.slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (doctor) {
      const slotIdx = doctor.availableSlots.findIndex(
        (s) => s.date === appt.slot.date && s.startTime === appt.slot.startTime
      );
      if (slotIdx !== -1) doctor.availableSlots[slotIdx].isBooked = false;
      await doctor.save();

      // Notify the doctor about cancellation
      await createNotification(
        doctor.user,
        "Appointment Cancelled",
        `An appointment for ${cancelFormattedDate} at ${appt.slot.startTime} has been cancelled by the patient.`,
        "general",
        appt._id
      );
    }

    // Confirm to patient
    await createNotification(
      req.user._id,
      "Appointment Cancelled",
      `Your appointment on ${cancelFormattedDate} at ${appt.slot.startTime} has been cancelled.`,
      "general",
      appt._id
    );

    res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPrescriptions = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: req.user._id,
      status: "completed",
      "prescription.notes": { $ne: "" },
    })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email phone" },
      })
      .sort({ "slot.date": -1, "slot.startTime": -1 });

    const prescriptions = appointments.map((appt) => ({
      appointmentId: appt._id,
      doctorName: appt.doctor?.user?.name,
      doctorSpecialization: appt.doctor?.specialization,
      appointmentDate: appt.slot.date,
      appointmentTime: appt.slot.startTime,
      prescription: appt.prescription,
    }));

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
