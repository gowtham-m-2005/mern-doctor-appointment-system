const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const validateTimeFormat = (time) => {
  if (!TIME_REGEX.test(time)) {
    throw new Error('Invalid time format. Use HH:MM format');
  }
  return true;
};

const validateFutureDate = (date) => {
  const today = new Date().toISOString().split('T')[0];
  if (date < today) {
    throw new Error('Cannot use past dates');
  }
  return true;
};

const validateSlot = (slot) => {
  if (!slot?.date || !slot?.startTime) {
    throw new Error('Slot date and startTime are required');
  }
  validateTimeFormat(slot.startTime);
  validateFutureDate(slot.date);
  return true;
};

const validate24HourNotice = (slotDate, slotStartTime) => {
  const apptDateTime = new Date(`${slotDate}T${slotStartTime}`);
  const diffHours = (apptDateTime - new Date()) / (1000 * 60 * 60);
  if (diffHours < 24) {
    throw new Error('Cannot modify within 24 hours of appointment');
  }
  return true;
};

module.exports = {
  validateTimeFormat,
  validateFutureDate,
  validateSlot,
  validate24HourNotice,
  TIME_REGEX,
};
