const Doctor = require("../models/Doctor.model");
const Appointment = require("../models/Appointment.model");
const User = require("../models/User.model");
const { createNotification } = require("../utils/notificationScheduler");
const { getCache, setCache, deleteCache, CacheTTL, CacheKeys } = require("../utils/cache");
const { publishEvent, EventTypes } = require("../utils/eventBus");
const { sendEmail } = require("../utils/emailService");
const { getAppointmentConfirmedTemplate, getAppointmentCompletedTemplate } = require("../utils/emailTemplates");

exports.getMyProfile = async (req, res) => {
  try {
    // Check cache first
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    
    const cached = await getCache(CacheKeys.doctorProfile(doctor._id));
    if (cached) {
      return res.json(cached);
    }
    
    const populatedDoctor = await doctor.populate("user", "-password");
    
    // Cache the doctor profile
    await setCache(CacheKeys.doctorProfile(doctor._id), populatedDoctor, CacheTTL.DOCTOR_PROFILE);
    
    res.json(populatedDoctor);
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
    if (!updates.specialization || !updates.qualification || updates.experience === undefined) {
      return res.status(400).json({ message: "Missing required fields: specialization, qualification, experience" });
    }

    // Handle fee fields - if virtualFee or inPersonFee not provided, use fee as fallback
    if (updates.virtualFee === undefined || updates.virtualFee === null) {
      updates.virtualFee = updates.fee || 100;
    }
    if (updates.inPersonFee === undefined || updates.inPersonFee === null) {
      updates.inPersonFee = updates.fee ? Math.round(updates.fee * 1.5) : 150;
    }

    // Handle maxAppointmentsPerDay with validation
    if (updates.maxAppointmentsPerDay !== undefined && updates.maxAppointmentsPerDay !== null) {
      updates.maxAppointmentsPerDay = Number(updates.maxAppointmentsPerDay);
      // Validate range
      if (updates.maxAppointmentsPerDay < 1 || updates.maxAppointmentsPerDay > 50) {
        return res.status(400).json({ message: "Max appointments per day must be between 1 and 50" });
      }
      // Check if new limit is below existing booked appointments
      const doctor = await Doctor.findOne({ user: req.user._id });
      const today = new Date().toISOString().split('T')[0];
      const futureBookedSlots = doctor.availableSlots.filter(s => 
        s.date >= today && s.isBooked
      ).length;
      
      if (updates.maxAppointmentsPerDay < futureBookedSlots) {
        return res.status(400).json({ 
          message: `Cannot set max appointments to ${updates.maxAppointmentsPerDay}. You already have ${futureBookedSlots} booked appointment(s) for upcoming days.` 
        });
      }
    } else {
      updates.maxAppointmentsPerDay = 10;
    }

    const updatedDoctor = await Doctor.findOneAndUpdate({ user: req.user._id }, updates, { new: true });
    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    
    // Invalidate cache
    await deleteCache(CacheKeys.doctorProfile(updatedDoctor._id));
    
    // Emit event
    await publishEvent(EventTypes.DOCTOR_PROFILE_UPDATED, {
      doctorId: updatedDoctor._id,
      updates
    });
    
    res.json(updatedDoctor);
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

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "Slots array is required" });
    }

    // Invalidate cache to ensure we work with fresh data
    await deleteCache(CacheKeys.doctorProfile(doctor._id));
    await deleteCache(CacheKeys.doctorSlots(doctor._id));

    const today = new Date().toISOString().split('T')[0];
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    // Validate each slot and check for duplicates/overlaps/past dates
    for (const slot of slots) {
      // Validate required fields
      if (!slot.date || !slot.startTime || !slot.endTime) {
        return res.status(400).json({ message: "Each slot must have date, startTime, and endTime" });
      }

      // Validate time format
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        return res.status(400).json({ message: "Invalid time format. Use HH:MM format" });
      }

      // Validate that end time is after start time
      if (slot.startTime >= slot.endTime) {
        return res.status(400).json({ message: "End time must be after start time" });
      }

      // Check for past dates
      if (slot.date < today) {
        const formattedDate = new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        return res.status(400).json({ 
          message: `Cannot add slots for past dates. ${formattedDate} is in the past.` 
        });
      }

      // Check for duplicate time slots on the same date
      const isDuplicate = doctor.availableSlots.some(s => 
        s.date === slot.date && 
        s.startTime === slot.startTime && 
        s.endTime === slot.endTime
      );
      if (isDuplicate) {
        return res.status(400).json({ 
          message: `A slot already exists for ${slot.date} from ${slot.startTime} to ${slot.endTime}.` 
        });
      }

      // Check for overlapping time slots on the same date
      const hasOverlap = doctor.availableSlots.some(s => 
        s.date === slot.date && 
        ((slot.startTime >= s.startTime && slot.startTime < s.endTime) ||
         (slot.endTime > s.startTime && slot.endTime <= s.endTime) ||
         (slot.startTime <= s.startTime && slot.endTime >= s.endTime))
      );
      if (hasOverlap) {
        const formattedDate = new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        return res.status(400).json({ 
          message: `Time slot overlaps with an existing slot on ${formattedDate}.` 
        });
      }
    }

    // Group slots by date and check against maxAppointmentsPerDay limit
    const slotsByDate = {};
    slots.forEach(slot => {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = 0;
      }
      slotsByDate[slot.date]++;
    });

    // Check each date against existing slots (both booked and unbooked) + new slots
    for (const date in slotsByDate) {
      const existingSlots = doctor.availableSlots.filter(s => s.date === date).length;
      const newSlots = slotsByDate[date];
      const totalSlots = existingSlots + newSlots;

      if (totalSlots > doctor.maxAppointmentsPerDay) {
        const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        return res.status(400).json({ 
          message: `Cannot add ${newSlots} slot(s) for ${formattedDate}. Maximum appointments per day is ${doctor.maxAppointmentsPerDay}. You already have ${existingSlots} slot(s).` 
        });
      }
    }

    doctor.availableSlots.push(...slots);
    await doctor.save();
    
    // Invalidate both profile and slots cache
    await deleteCache(CacheKeys.doctorProfile(doctor._id));
    await deleteCache(CacheKeys.doctorSlots(doctor._id));
    
    // Emit event
    await publishEvent(EventTypes.SLOT_CREATED, {
      doctorId: doctor._id,
      slots
    });
    
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
    
    // Invalidate both profile and slots cache
    await deleteCache(CacheKeys.doctorProfile(doctor._id));
    await deleteCache(CacheKeys.doctorSlots(doctor._id));
    
    // Emit event
    await publishEvent(EventTypes.SLOT_REMOVED, {
      doctorId: doctor._id,
      slotId
    });
    
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
      .sort({ "slot.date": 1, "slot.startTime": 1 });
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
    // Check cache first
    const cached = await getCache(CacheKeys.dashboardStats(req.user._id));
    if (cached) {
      return res.json(cached);
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    const appointments = await Appointment.find({ doctor: doctor._id });
    const today = new Date().toISOString().split("T")[0];

    const todayAppts = appointments.filter((a) => {
      const slotDate = new Date(a.slot.date).toISOString().split("T")[0];
      return slotDate === today;
    });
    
    // Count unique patients (unique user IDs) for today
    const uniquePatientsToday = new Set(todayAppts.map(a => a.user.toString())).size;
    
    // Count pending appointments for today (not completed)
    const todayPending = todayAppts.filter((a) => a.status !== "completed" && a.status !== "cancelled").length;
    
    const completed = appointments.filter((a) => a.status === "completed").length;
    const todayCompleted = todayAppts.filter((a) => a.status === "completed").length;
    const totalEarnings = appointments
      .filter((a) => a.status === "completed" || a.status === "confirmed")
      .reduce((sum, a) => sum + a.doctorFee, 0);
    
    // Calculate pending earnings (confirmed but not completed)
    const pendingEarnings = appointments
      .filter((a) => a.status === "confirmed")
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

    const stats = { total: appointments.length, today: uniquePatientsToday, todayPending, completed, todayCompleted, totalEarnings, pendingEarnings, growthPercent };
    
    // Cache dashboard stats
    await setCache(CacheKeys.dashboardStats(req.user._id), stats, CacheTTL.DASHBOARD_STATS);
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.completeAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "name");
    const appt = await Appointment.findOne({ _id: req.params.id, doctor: doctor._id }).populate("user", "name email");
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    // Prevent completing already completed or cancelled appointments
    if (appt.status === "completed") {
      return res.status(400).json({ message: "Appointment is already completed" });
    }
    if (appt.status === "cancelled") {
      return res.status(400).json({ message: "Cannot complete a cancelled appointment" });
    }

    if (appt.status !== "confirmed") {
      return res.status(400).json({ message: "Only confirmed appointments can be completed" });
    }

    // Prevent completing future appointments
    const today = new Date().toISOString().split("T")[0];
    const appointmentDate = new Date(appt.slot.date).toISOString().split("T")[0];
    if (appointmentDate > today) {
      return res.status(400).json({ message: "Cannot complete a future appointment" });
    }

    if (!appt.prescription || !appt.prescription.medicines || appt.prescription.medicines.length === 0) {
      return res.status(400).json({ message: "Please add a prescription before completing the appointment" });
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

    // Send thank you email with prescription
    if (appt.user?.email) {
      const formattedDate = new Date(appt.slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const htmlTemplate = getAppointmentCompletedTemplate(
        appt.user.name,
        doctor.user?.name || "Doctor",
        formattedDate,
        appt.slot.startTime,
        appt.prescription
      );
      await sendEmail(
        appt.user.email,
        "Appointment Completed - Prescription",
        `Thank you for visiting Dr. ${doctor.user?.name || "Doctor"}. Your appointment has been completed. Your prescription has been attached.`,
        htmlTemplate
      );
    }

    res.json({ message: "Appointment marked as completed", appointment: appt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.confirmAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "name");
    const appt = await Appointment.findOne({ _id: req.params.id, doctor: doctor._id }).populate("user", "name email");
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    // Prevent confirming already confirmed/completed/cancelled appointments
    if (appt.status === "confirmed") {
      return res.status(400).json({ message: "Appointment is already confirmed" });
    }
    if (appt.status === "completed") {
      return res.status(400).json({ message: "Cannot confirm a completed appointment" });
    }
    if (appt.status === "cancelled") {
      return res.status(400).json({ message: "Cannot confirm a cancelled appointment" });
    }

    if (appt.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be confirmed" });
    }

    appt.status = "confirmed";
    await appt.save();

    // Emit event with populated doctor
    await publishEvent(EventTypes.APPOINTMENT_CONFIRMED, {
      appointmentId: appt._id,
      doctor: doctor,
      appointment: appt
    });

    // Notify patient that appointment is confirmed
    const formattedDate = new Date(appt.slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    await createNotification(
      appt.user,
      "Appointment Confirmed",
      `Your appointment for ${formattedDate} at ${appt.slot.startTime} has been confirmed by Dr. ${doctor.user?.name || ""}.`,
      "booking",
      appt._id
    );

    // Send email confirmation
    if (appt.user?.email) {
      const htmlTemplate = getAppointmentConfirmedTemplate(
        appt.user.name,
        doctor.user?.name || "Doctor",
        formattedDate,
        appt.slot.startTime
      );
      await sendEmail(
        appt.user.email,
        "Appointment Confirmed",
        `Your appointment with Dr. ${doctor.user?.name || "Doctor"} for ${formattedDate} at ${appt.slot.startTime} has been confirmed.`,
        htmlTemplate
      );
    }

    res.json({ message: "Appointment confirmed successfully", appointment: appt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
