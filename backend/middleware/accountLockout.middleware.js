// Track failed login attempts in memory (in production, use Redis)
const failedAttempts = new Map();
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const checkAccountLockout = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return null;
  }
  
  const key = email.toLowerCase().trim();
  const attemptData = failedAttempts.get(key);
  
  if (attemptData && attemptData.lockedUntil && Date.now() < attemptData.lockedUntil) {
    const remainingTime = Math.ceil((attemptData.lockedUntil - Date.now()) / 60000);
    return {
      locked: true,
      retryAfter: `${remainingTime} minutes`,
    };
  }
  
  return null;
};

const recordFailedAttempt = (email) => {
  const key = email.toLowerCase().trim();
  const attemptData = failedAttempts.get(key) || { count: 0, lockedUntil: null };
  
  attemptData.count += 1;
  
  if (attemptData.count >= MAX_ATTEMPTS) {
    attemptData.lockedUntil = Date.now() + LOCKOUT_TIME;
    console.log(`Account locked for ${key} due to ${attemptData.count} failed attempts`);
  }
  
  failedAttempts.set(key, attemptData);
  
  // Clean up old entries periodically
  if (failedAttempts.size > 1000) {
    const now = Date.now();
    for (const [k, v] of failedAttempts.entries()) {
      if (!v.lockedUntil || v.lockedUntil < now) {
        failedAttempts.delete(k);
      }
    }
  }
};

const resetFailedAttempts = (email) => {
  const key = email.toLowerCase().trim();
  failedAttempts.delete(key);
};

module.exports = {
  checkAccountLockout,
  recordFailedAttempt,
  resetFailedAttempts,
};
