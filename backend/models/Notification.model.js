const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["booking", "reminder", "completion", "approval", "general"],
      default: "general",
    },
    isRead: { type: Boolean, default: false },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
