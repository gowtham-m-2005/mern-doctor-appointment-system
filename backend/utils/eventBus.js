const { redisClient, redisSubscriber } = require('../config/redis');

// Event types
const EventTypes = {
  APPOINTMENT_BOOKED: 'appointment.booked',
  APPOINTMENT_CONFIRMED: 'appointment.confirmed',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  APPOINTMENT_COMPLETED: 'appointment.completed',
  APPOINTMENT_RESCHEDULED: 'appointment.rescheduled',
  SLOT_CREATED: 'slot.created',
  SLOT_REMOVED: 'slot.removed',
  PRESCRIPTION_ADDED: 'prescription.added',
  DOCTOR_PROFILE_UPDATED: 'doctor.profile.updated',
};

// Publish event to Redis
async function publishEvent(eventType, data) {
  try {
    await redisClient.publish(eventType, JSON.stringify(data));
  } catch (error) {
    console.error(`Error publishing event ${eventType}:`, error);
  }
}

// Subscribe to events
function subscribeToEvent(eventType, callback) {
  redisSubscriber.subscribe(eventType, (message) => {
    try {
      const data = JSON.parse(message);
      callback(data);
    } catch (error) {
      console.error(`Error parsing event ${eventType}:`, error);
    }
  });
}

// Initialize subscribers
function initializeSubscribers() {
  redisSubscriber.connect();
}

module.exports = {
  EventTypes,
  publishEvent,
  subscribeToEvent,
  initializeSubscribers,
};
