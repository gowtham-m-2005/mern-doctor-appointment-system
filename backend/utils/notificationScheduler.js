const cron = require("node-cron");
const Appointment = require("../models/Appointment.model");
const Notification = require("../models/Notification.model");
const { sendEmail } = require("./emailService");

// Must be defined BEFORE scheduleNotifications since cron jobs use it
const createNotification = async (userId, title, message, type, appointmentId) => {
  try {
    await Notification.create({ user: userId, title, message, type, appointment: appointmentId });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};

const sendReminder = async (appt, timeText) => {
  try {
    await createNotification(
      appt.user._id || appt.user,
      "Appointment Reminder",
      `Your appointment is in ${timeText}.`,
      "reminder",
      appt._id
    );
    if (appt.user?.email) {
      await sendEmail(
        appt.user.email,
        "Appointment Reminder",
        `Reminder: Your appointment is in ${timeText}. Date: ${appt.slot.date} at ${appt.slot.startTime}.`
      );
    }
  } catch (err) {
    console.error("Failed to send reminder:", err.message);
  }
};

const scheduleNotifications = () => {
  // Check reminders every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();
      const appointments = await Appointment.find({
        status: { $in: ["confirmed", "pending"] },
      }).populate("user doctor");

      for (const appt of appointments) {
        try {
          const apptDateTime = new Date(`${appt.slot.date}T${appt.slot.startTime}`);
          const diffMs = apptDateTime - now;
          const diffHours = diffMs / (1000 * 60 * 60);
          const diffMins = diffMs / (1000 * 60);

          // 1 day before: trigger between 23h and 25h before (wider window = resilient to missed polls)
          if (!appt.remindersSent.oneDayBefore && diffHours > 0 && diffHours <= 25 && diffHours > 1) {
            await sendReminder(appt, "1 day");
            appt.remindersSent.oneDayBefore = true;
          }
          // 1 hour before: trigger between 55min and 65min
          if (!appt.remindersSent.oneHourBefore && diffMins > 0 && diffMins <= 65 && diffMins > 10) {
            await sendReminder(appt, "1 hour");
            appt.remindersSent.oneHourBefore = true;
          }
          // 15 min before: trigger between 10min and 20min
          if (!appt.remindersSent.fifteenMinBefore && diffMins > 0 && diffMins <= 20) {
            await sendReminder(appt, "15 minutes");
            appt.remindersSent.fifteenMinBefore = true;
          }

          await appt.save();
        } catch (apptErr) {
          console.error(`Reminder error for appt ${appt._id}:`, apptErr.message);
        }
      }
    } catch (err) {
      console.error("Notification cron error:", err.message);
    }
  });

  // Auto-complete appointments 30+ minutes after slot start
  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = new Date();
      const appointments = await Appointment.find({ status: "confirmed" });
      for (const appt of appointments) {
        try {
          const apptDateTime = new Date(`${appt.slot.date}T${appt.slot.startTime}`);
          if (now > apptDateTime && now - apptDateTime > 30 * 60 * 1000) {
            appt.status = "completed";
            await appt.save();
            await createNotification(
              appt.user,
              "Appointment Completed",
              "Your appointment has been marked as completed.",
              "completion",
              appt._id
            );
          }
        } catch (apptErr) {
          console.error(`Auto-complete error for appt ${appt._id}:`, apptErr.message);
        }
      }
    } catch (err) {
      console.error("Auto-complete cron error:", err.message);
    }
  });
};

scheduleNotifications();
module.exports = { scheduleNotifications, createNotification };
