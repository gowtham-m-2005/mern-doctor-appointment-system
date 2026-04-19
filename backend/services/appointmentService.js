const Appointment = require('../models/Appointment.model');
const Doctor = require('../models/Doctor.model');
const { calculateFee } = require('../utils/feeCalculator');
const { publishEvent, EventTypes } = require('../utils/eventBus');
const { getCache, deleteCache, CacheKeys } = require('../utils/cache');
const { validateSlot, validate24HourNotice } = require('../utils/validators');
const {
  findAvailableSlot,
  findSlotIndex,
  markSlotBooked,
  markSlotAvailable,
  getNextAvailableSlot,
  checkMaxAppointmentsForDate,
} = require('../utils/slotManager');
const { notifyAppointmentCancelled, notifyAppointmentRescheduled, notifyAppointmentAutoRescheduled } = require('../utils/notificationHelpers');

const bookAppointment = async (userId, doctorId, slot) => {
  validateSlot(slot);

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error('Doctor not found');
  if (doctor.user.toString() === userId.toString()) {
    throw new Error('You cannot book appointments with yourself');
  }
  if (doctor.isApproved !== 'approved') {
    throw new Error('This doctor is not accepting appointments');
  }

  const existing = await Appointment.findOne({
    user: userId,
    doctor: doctorId,
    'slot.date': slot.date,
    'slot.startTime': slot.startTime,
    status: { $in: ['confirmed', 'pending'] },
  });
  if (existing) throw new Error('You already have a booking for this slot');

  const today = new Date().toISOString().split('T')[0];
  const pendingAppts = await Appointment.find({
    user: userId,
    status: { $in: ['pending', 'confirmed'] },
    'slot.date': { $gte: today },
  });

  if (pendingAppts.length >= 10) {
    throw new Error('You have too many pending appointments. Please wait for confirmation or cancel some.');
  }

  const slotIdx = findAvailableSlot(doctor, slot.date, slot.startTime);
  if (slotIdx === -1) throw new Error('Slot not available');

  const isMaxReached = await checkMaxAppointmentsForDate(
    Appointment,
    doctorId,
    slot.date,
    doctor.maxAppointmentsPerDay
  );
  if (isMaxReached) {
    throw new Error(`Doctor has reached maximum appointments (${doctor.maxAppointmentsPerDay}) for this date. Please choose another date.`);
  }

  markSlotBooked(doctor, slotIdx);
  await doctor.save();

  const fees = await calculateFee(doctor.fee);
  const appointment = await Appointment.create({
    user: userId,
    doctor: doctorId,
    slot: {
      date: slot.date,
      startTime: slot.startTime,
      endTime: doctor.availableSlots[slotIdx].endTime,
    },
    doctorFee: fees.doctorFee,
    commission: fees.commission,
    totalFee: fees.totalFee,
  });

  await deleteCache(CacheKeys.doctorSlots(doctorId));

  const populated = await appointment.populate([
    { path: 'user', select: 'name email' },
    { path: 'doctor', populate: { path: 'user', select: 'name' } },
  ]);

  await publishEvent(EventTypes.APPOINTMENT_BOOKED, {
    appointment: populated,
    user: { _id: userId, name: (await Doctor.findById(doctorId).populate('user')).user.name },
    doctor: { _id: doctor._id, user: doctor.user },
  });

  return populated;
};

const cancelAppointment = async (appointmentId, userId) => {
  const appt = await Appointment.findOne({ _id: appointmentId, user: userId });
  if (!appt) throw new Error('Appointment not found');

  if (appt.status === 'cancelled') throw new Error('Appointment is already cancelled');
  if (appt.status === 'completed') throw new Error('Cannot cancel a completed appointment');

  const doctor = await Doctor.findById(appt.doctor);

  if (appt.status === 'pending') {
    appt.status = 'cancelled';
    await appt.save();

    if (doctor) {
      const slotIdx = findSlotIndex(doctor, appt.slot.date, appt.slot.startTime);
      markSlotAvailable(doctor, slotIdx);
      await doctor.save();
      await deleteCache(CacheKeys.doctorSlots(doctor._id));
      await deleteCache(CacheKeys.doctorProfile(doctor._id));
    }

    await notifyAppointmentCancelled(userId, doctor?.user, appt.slot.date, appt.slot.startTime, appt._id);
    return { message: 'Appointment cancelled successfully' };
  }

  validate24HourNotice(appt.slot.date, appt.slot.startTime);

  appt.status = 'cancelled';
  await appt.save();

  if (doctor) {
    const slotIdx = findSlotIndex(doctor, appt.slot.date, appt.slot.startTime);
    markSlotAvailable(doctor, slotIdx);
    await doctor.save();
    await deleteCache(CacheKeys.doctorSlots(doctor._id));
    await deleteCache(CacheKeys.doctorProfile(doctor._id));
  }

  await notifyAppointmentCancelled(userId, doctor?.user, appt.slot.date, appt.slot.startTime, appt._id);
  return { message: 'Appointment cancelled successfully' };
};

const rescheduleAppointment = async (appointmentId, userId, newSlot, confirmed = false) => {
  validateSlot(newSlot);

  const appt = await Appointment.findOne({ _id: appointmentId, user: userId });
  if (!appt) throw new Error('Appointment not found');

  if (appt.status === 'completed') throw new Error('Cannot reschedule completed appointments');
  if (appt.status === 'cancelled') throw new Error('Cannot reschedule cancelled appointments');

  validate24HourNotice(appt.slot.date, appt.slot.startTime);

  const doctor = await Doctor.findById(appt.doctor);
  const newSlotIdx = findAvailableSlot(doctor, newSlot.date, newSlot.startTime);

  if (newSlotIdx === -1) {
    if (confirmed) {
      const nextAvailable = getNextAvailableSlot(doctor, newSlot.date, newSlot.startTime);
      if (!nextAvailable) throw new Error('No slots available');

      const isMaxReached = await checkMaxAppointmentsForDate(
        Appointment,
        appt.doctor,
        nextAvailable.date,
        doctor.maxAppointmentsPerDay,
        appointmentId
      );

      if (isMaxReached) {
        throw new Error(`Doctor has reached maximum appointments (${doctor.maxAppointmentsPerDay}) for ${nextAvailable.date}. Please choose another date.`);
      }

      const oldSlotIdx = findSlotIndex(doctor, appt.slot.date, appt.slot.startTime);
      markSlotAvailable(doctor, oldSlotIdx);

      appt.rescheduleHistory.push({
        fromDate: appt.slot.date,
        fromStart: appt.slot.startTime,
        toDate: nextAvailable.date,
        toStart: nextAvailable.startTime,
      });
      appt.slot = {
        date: nextAvailable.date,
        startTime: nextAvailable.startTime,
        endTime: nextAvailable.endTime,
      };
      markSlotBooked(doctor, doctor.availableSlots.indexOf(nextAvailable));

      await doctor.save();
      await appt.save();

      await deleteCache(CacheKeys.doctorSlots(doctor._id));
      await deleteCache(CacheKeys.doctorProfile(doctor._id));

      await notifyAppointmentAutoRescheduled(userId, nextAvailable.date, nextAvailable.startTime, appt._id);
      return appt;
    }
    throw new Error('Selected slot not available');
  }

  const isMaxReached = await checkMaxAppointmentsForDate(
    Appointment,
    appt.doctor,
    newSlot.date,
    doctor.maxAppointmentsPerDay,
    appointmentId
  );

  if (isMaxReached) {
    throw new Error(`Doctor has reached maximum appointments (${doctor.maxAppointmentsPerDay}) for ${newSlot.date}. Please choose another date.`);
  }

  const oldSlotIdx = findSlotIndex(doctor, appt.slot.date, appt.slot.startTime);
  markSlotAvailable(doctor, oldSlotIdx);

  appt.rescheduleHistory.push({
    fromDate: appt.slot.date,
    fromStart: appt.slot.startTime,
    toDate: newSlot.date,
    toStart: newSlot.startTime,
  });
  appt.slot = {
    date: newSlot.date,
    startTime: newSlot.startTime,
    endTime: doctor.availableSlots[newSlotIdx].endTime,
  };
  markSlotBooked(doctor, newSlotIdx);

  await doctor.save();
  await appt.save();

  await deleteCache(CacheKeys.doctorSlots(doctor._id));
  await deleteCache(CacheKeys.doctorProfile(doctor._id));

  await notifyAppointmentRescheduled(userId, newSlot.date, newSlot.startTime, appt._id);
  return appt;
};

module.exports = {
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
};
