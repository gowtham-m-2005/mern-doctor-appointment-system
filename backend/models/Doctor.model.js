const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    specialization: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true },
    fee: { type: Number, required: true },
    virtualFee: { type: Number, default: null },
    inPersonFee: { type: Number, default: null },
    maxAppointmentsPerDay: { type: Number, default: 10 },
    certificate: { type: String },
    bio: { type: String, default: "" },
    isApproved: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    availableSlots: [slotSchema],
    address: { type: String, default: "" },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
