const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    slot: {
      date: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rescheduled"],
      default: "pending",
    },
    doctorFee: { type: Number, required: true },
    commission: { type: Number, required: true },
    totalFee: { type: Number, required: true },
    prescription: {
      notes: { type: String, default: "" },
      medicines: [{ name: String, dosage: String, duration: String }],
      addedAt: { type: Date },
    },
    remindersSent: {
      oneDayBefore: { type: Boolean, default: false },
      oneHourBefore: { type: Boolean, default: false },
      fifteenMinBefore: { type: Boolean, default: false },
    },
    rescheduleHistory: [
      {
        fromDate: String,
        fromStart: String,
        toDate: String,
        toStart: String,
        rescheduledAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
