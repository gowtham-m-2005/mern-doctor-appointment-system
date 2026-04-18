const { redisClient } = require('../config/redis');

// Cache TTL in seconds
const CacheTTL = {
  DOCTOR_PROFILE: 3600, // 1 hour
  AVAILABLE_SLOTS: 300, // 5 minutes
  DASHBOARD_STATS: 60, // 1 minute
  DOCTORS_LIST: 600, // 10 minutes
};

// Set cache
async function setCache(key, value, ttl = 3600) {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

// Get cache
async function getCache(key) {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
}

// Delete cache
async function deleteCache(key) {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Error deleting cache:', error);
  }
}

// Delete cache by pattern
async function deleteCachePattern(pattern) {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Error deleting cache pattern:', error);
  }
}

// Cache key generators
const CacheKeys = {
  doctorProfile: (doctorId) => `doctor:${doctorId}:profile`,
  doctorSlots: (doctorId) => `doctor:${doctorId}:slots`,
  dashboardStats: (userId) => `dashboard:${userId}:stats`,
  doctorsList: (filters) => `doctors:list:${JSON.stringify(filters)}`,
};

module.exports = {
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  CacheTTL,
  CacheKeys,
};
