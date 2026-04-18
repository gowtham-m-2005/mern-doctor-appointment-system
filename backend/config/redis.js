const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('connect', () => {
  console.log('✓ Redis connected');
});

redisClient.on('error', (err) => {
  console.error('✗ Redis connection error:', err);
});

// Create a separate client for pub/sub
const redisSubscriber = redis.createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisSubscriber.on('connect', () => {
  console.log('✓ Redis subscriber connected');
});

redisSubscriber.on('error', (err) => {
  console.error('✗ Redis subscriber error:', err);
});

module.exports = { redisClient, redisSubscriber };
