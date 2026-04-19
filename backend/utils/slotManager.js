const Doctor = require('../models/Doctor.model');

const findAvailableSlot = (doctor, date, startTime) => {
  return doctor.availableSlots.findIndex(
    (s) => s.date === date && s.startTime === startTime && !s.isBooked
  );
};

const findSlotIndex = (doctor, date, startTime) => {
  return doctor.availableSlots.findIndex(
    (s) => s.date === date && s.startTime === startTime
  );
};

const markSlotBooked = (doctor, slotIndex) => {
  if (slotIndex !== -1) {
    doctor.availableSlots[slotIndex].isBooked = true;
  }
};

const markSlotAvailable = (doctor, slotIndex) => {
  if (slotIndex !== -1) {
    doctor.availableSlots[slotIndex].isBooked = false;
  }
};

const getNextAvailableSlot = (doctor, currentDate, currentTime) => {
  return doctor.availableSlots.find(
    (s) => !s.isBooked && (s.date > currentDate || (s.date === currentDate && s.startTime > currentTime))
  );
};

const checkMaxAppointmentsForDate = async (Appointment, doctorId, date, maxAppointments, excludeAppointmentId = null) => {
  const query = {
    doctor: doctorId,
    'slot.date': date,
    status: { $in: ['pending', 'confirmed'] },
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const existingAppointments = await Appointment.find(query);
  return existingAppointments.length >= maxAppointments;
};

module.exports = {
  findAvailableSlot,
  findSlotIndex,
  markSlotBooked,
  markSlotAvailable,
  getNextAvailableSlot,
  checkMaxAppointmentsForDate,
};
