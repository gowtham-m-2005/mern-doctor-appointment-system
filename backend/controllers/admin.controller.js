const User = require("../models/User.model");
const Doctor = require("../models/Doctor.model");
const Appointment = require("../models/Appointment.model");
const Settings = require("../models/Settings.model");
const { createNotification } = require("../utils/notificationScheduler");

exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: "pending" }).populate("user", "name email phone");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Returns ALL doctors (all statuses) for admin management table
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).populate("user", "name email phone");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'." });
    }

    const doctor = await Doctor.findByIdAndUpdate(id, { isApproved: status }, { new: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const statusText = status === "approved" ? "approved" : "rejected";
    await createNotification(
      doctor.user,
      `Account ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      `Your doctor account application has been ${statusText}. ${
        status === "approved"
          ? "You can now log in and start accepting appointments."
          : "Please contact support for more information."
      }`,
      "approval"
    );

    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate("user", "name email phone")
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(filter);
    res.json({ appointments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalDoctors = await Doctor.countDocuments({ isApproved: "approved" });
    const pendingDoctors = await Doctor.countDocuments({ isApproved: "pending" });
    const totalAppointments = await Appointment.countDocuments();
    const revenueAgg = await Appointment.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$commission" } } },
    ]);

    res.json({
      totalUsers,
      totalDoctors,
      pendingDoctors,
      totalAppointments,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    const updates = { ...req.body };
    if (req.file) updates.appLogo = `/uploads/${req.file.filename}`;

    // Validate commission
    if (updates.commissionPercent !== undefined) {
      const pct = Number(updates.commissionPercent);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        return res.status(400).json({ message: "Commission must be between 0 and 100" });
      }
      updates.commissionPercent = pct;
    }

    Object.assign(settings, updates);
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot deactivate admin" });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
