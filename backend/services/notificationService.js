const Notification = require('../models/Notification.model');
const { subscribeToEvent, initializeSubscribers } = require('../utils/eventBus');

// Handle appointment booked event
async function handleAppointmentBooked(data) {
  const { appointment, user, doctor } = data;
  
  // Notify patient
  await Notification.create({
    user: user._id,
    title: "Appointment Requested",
    message: `Your appointment request for ${new Date(appointment.slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${appointment.slot.startTime} is pending doctor confirmation.`,
    type: "booking",
    appointment: appointment._id,
  });

  // Notify doctor
  await Notification.create({
    user: doctor.user,
    title: "New Appointment Request",
    message: `${user.name} has requested an appointment for ${new Date(appointment.slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${appointment.slot.startTime}. Please confirm or cancel.`,
    type: "booking",
    appointment: appointment._id,
  });
}

// Handle appointment confirmed event
async function handleAppointmentConfirmed(data) {
  const { appointment, doctor } = data;
  
  await Notification.create({
    user: appointment.user,
    title: "Appointment Confirmed",
    message: `Your appointment on ${new Date(appointment.slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${appointment.slot.startTime} has been confirmed by ${doctor?.user?.name || 'your doctor'}.`,
    type: "booking",
    appointment: appointment._id,
  });
}

// Handle appointment cancelled event
async function handleAppointmentCancelled(data) {
  const { appointment, cancelledBy } = data;
  
  if (cancelledBy === 'patient') {
    await Notification.create({
      user: appointment.doctor,
      title: "Appointment Cancelled",
      message: `An appointment for ${new Date(appointment.slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${appointment.slot.startTime} has been cancelled by the patient.`,
      type: "general",
      appointment: appointment._id,
    });
  } else if (cancelledBy === 'doctor') {
    await Notification.create({
      user: appointment.user,
      title: "Appointment Cancelled",
      message: `Your appointment on ${new Date(appointment.slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${appointment.slot.startTime} has been cancelled by the doctor.`,
      type: "general",
      appointment: appointment._id,
    });
  }
}

// Handle appointment completed event
async function handleAppointmentCompleted(data) {
  const { appointment } = data;
  
  await Notification.create({
    user: appointment.user,
    title: "Prescription Available",
    message: `Your doctor has added a prescription for your appointment on ${new Date(appointment.slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}.`,
    type: "general",
    appointment: appointment._id,
  });
}

// Initialize notification service subscribers
function initializeNotificationService() {
  initializeSubscribers();
  
  subscribeToEvent('appointment.booked', handleAppointmentBooked);
  subscribeToEvent('appointment.confirmed', handleAppointmentConfirmed);
  subscribeToEvent('appointment.cancelled', handleAppointmentCancelled);
  subscribeToEvent('appointment.completed', handleAppointmentCompleted);
  
  console.log('✓ Notification service initialized');
}

module.exports = {
  initializeNotificationService,
};
