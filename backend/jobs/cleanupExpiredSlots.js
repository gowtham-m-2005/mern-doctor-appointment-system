const Doctor = require('../models/Doctor.model');

// Remove expired slots (slots for past dates or past times on current date)
async function cleanupExpiredSlots() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const doctors = await Doctor.find({});
    let hasChanges = false;
    
    for (const doctor of doctors) {
      // Filter out expired slots
      const validSlots = doctor.availableSlots.filter(slot => {
        // Remove slots for past dates
        if (slot.date < today) {
          return false;
        }
        // Remove slots for today if end time has passed
        if (slot.date === today && slot.endTime < currentTime) {
          return false;
        }
        return true;
      });

      if (validSlots.length !== doctor.availableSlots.length) {
        doctor.availableSlots = validSlots;
        await doctor.save();
        hasChanges = true;
      }
    }

    if (hasChanges) {
      console.log('✓ Cleaned up expired slots');
    }
  } catch (error) {
    console.error('✗ Error cleaning up expired slots:', error);
  }
}

module.exports = { cleanupExpiredSlots };
