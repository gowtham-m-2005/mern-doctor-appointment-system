const Appointment = require("../models/Appointment.model");
const Doctor = require("../models/Doctor.model");
const { createNotification } = require("../utils/notificationScheduler");

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("user", "name email")
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newSlot, confirmed } = req.body;
    const userId = req.user._id;

    if (!newSlot || !newSlot.date || !newSlot.startTime) {
      return res.status(400).json({ message: "newSlot.date and newSlot.startTime are required" });
    }

    const appt = await Appointment.findOne({ _id: id, user: userId });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    // Prevent rescheduling completed or cancelled appointments
    if (appt.status === "completed") {
      return res.status(400).json({ message: "Cannot reschedule completed appointments" });
    }
    if (appt.status === "cancelled") {
      return res.status(400).json({ message: "Cannot reschedule cancelled appointments" });
    }

    const oldDateTime = new Date(`${appt.slot.date}T${appt.slot.startTime}`);
    const diffHours = (oldDateTime - new Date()) / (1000 * 60 * 60);
    if (diffHours < 24) return res.status(400).json({ message: "Cannot reschedule within 24 hours" });

    // Prevent rescheduling to past dates
    const today = new Date().toISOString().split('T')[0];
    if (newSlot.date < today) {
      return res.status(400).json({ message: "Cannot reschedule to past dates" });
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newSlot.startTime)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:MM format" });
    }

    const doctor = await Doctor.findById(appt.doctor);
    const newSlotIdx = doctor.availableSlots.findIndex(
      (s) => s.date === newSlot.date && s.startTime === newSlot.startTime && !s.isBooked
    );

    if (newSlotIdx === -1) {
      if (confirmed) {
        const nextAvailable = doctor.availableSlots.find((s) => !s.isBooked && (s.date > newSlot.date || (s.date === newSlot.date && s.startTime > newSlot.startTime)));
        if (!nextAvailable) return res.status(400).json({ message: "No slots available" });

        // Check if doctor has reached max appointments for the new date
        const existingAppointmentsForNewDate = await Appointment.find({
          doctor: appt.doctor,
          "slot.date": nextAvailable.date,
          status: { $in: ["pending", "confirmed"] },
          _id: { $ne: id }
        });

        if (existingAppointmentsForNewDate.length >= doctor.maxAppointmentsPerDay) {
          return res.status(400).json({ 
            message: `Doctor has reached maximum appointments (${doctor.maxAppointmentsPerDay}) for ${nextAvailable.date}. Please choose another date.` 
          });
        }

        const oldSlotIdx = doctor.availableSlots.findIndex((s) => s.date === appt.slot.date && s.startTime === appt.slot.startTime);
        if (oldSlotIdx !== -1) doctor.availableSlots[oldSlotIdx].isBooked = false;

        appt.rescheduleHistory.push({ fromDate: appt.slot.date, fromStart: appt.slot.startTime, toDate: nextAvailable.date, toStart: nextAvailable.startTime });
        appt.slot = { date: nextAvailable.date, startTime: nextAvailable.startTime, endTime: nextAvailable.endTime };
        nextAvailable.isBooked = true;

        await doctor.save();
        await appt.save();
        const formattedDate = new Date(nextAvailable.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        await createNotification(userId, "Appointment Rescheduled", `Auto-rescheduled to ${formattedDate} at ${nextAvailable.startTime}.`, "general", appt._id);
        return res.json(appt);
      }
      return res.status(400).json({ message: "Selected slot not available", needsConfirmation: true });
    }

    // Check if doctor has reached max appointments for the new date
    const existingAppointmentsForNewDate = await Appointment.find({
      doctor: appt.doctor,
      "slot.date": newSlot.date,
      status: { $in: ["pending", "confirmed"] },
      _id: { $ne: id }
    });

    if (existingAppointmentsForNewDate.length >= doctor.maxAppointmentsPerDay) {
      return res.status(400).json({ 
        message: `Doctor has reached maximum appointments (${doctor.maxAppointmentsPerDay}) for ${newSlot.date}. Please choose another date.` 
      });
    }

    const oldSlotIdx = doctor.availableSlots.findIndex((s) => s.date === appt.slot.date && s.startTime === appt.slot.startTime);
    if (oldSlotIdx !== -1) doctor.availableSlots[oldSlotIdx].isBooked = false;

    appt.rescheduleHistory.push({ fromDate: appt.slot.date, fromStart: appt.slot.startTime, toDate: newSlot.date, toStart: newSlot.startTime });
    appt.slot = { date: newSlot.date, startTime: newSlot.startTime, endTime: doctor.availableSlots[newSlotIdx].endTime };
    doctor.availableSlots[newSlotIdx].isBooked = true;

    await doctor.save();
    await appt.save();
    const formattedDate = new Date(newSlot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    await createNotification(userId, "Appointment Rescheduled", `Rescheduled to ${formattedDate} at ${newSlot.startTime}.`, "general", appt._id);
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate("user", "name email phone")
      .populate({ path: "doctor", populate: { path: "user", select: "name email phone" } });
    if (!appt) return res.status(404).json({ message: "Not found" });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
