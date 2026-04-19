const { createNotification } = require('./notificationScheduler');

const notifyAppointmentCancelled = async (userId, doctorUserId, appointmentDate, appointmentTime, appointmentId) => {
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const message = `Your appointment on ${formattedDate} at ${appointmentTime} has been cancelled.`;

  await Promise.all([
    createNotification(userId, 'Appointment Cancelled', message, 'general', appointmentId),
    createNotification(
      doctorUserId,
      'Appointment Cancelled',
      `An appointment for ${formattedDate} at ${appointmentTime} has been cancelled by the patient.`,
      'general',
      appointmentId
    ),
  ]);
};

const notifyAppointmentRescheduled = async (userId, newDate, newTime, appointmentId) => {
  const formattedDate = new Date(newDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const message = `Rescheduled to ${formattedDate} at ${newTime}.`;

  await createNotification(userId, 'Appointment Rescheduled', message, 'general', appointmentId);
};

const notifyAppointmentAutoRescheduled = async (userId, newDate, newTime, appointmentId) => {
  const formattedDate = new Date(newDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const message = `Auto-rescheduled to ${formattedDate} at ${newTime}.`;

  await createNotification(userId, 'Appointment Rescheduled', message, 'general', appointmentId);
};

module.exports = {
  notifyAppointmentCancelled,
  notifyAppointmentRescheduled,
  notifyAppointmentAutoRescheduled,
};
