// src/services/auth/services/otpStore.ts
import Redis from 'ioredis';
import logger from '../../../core/logger';

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Handle Redis connection events
redis.on('connect', () => {
  logger.info('Redis client connected');
});

redis.on('error', (err) => {
  logger.error('Redis client error:', err);
});

/**
 * Store OTP in Redis with expiration
 */
export const setOTP = async (
  phoneNumber: string,
  otp: string,
  expiresIn: number = 300 // 5 minutes in seconds
): Promise<void> => {
  const key = `otp:${phoneNumber}`;
  const data = JSON.stringify({ otp, attempts: 0, createdAt: new Date().toISOString() });
  await redis.setex(key, expiresIn, data);
  logger.debug(`OTP stored for ${phoneNumber}, expires in ${expiresIn}s`);
};

/**
 * Get OTP data from Redis
 */
export const getOTP = async (
  phoneNumber: string
): Promise<{ otp: string; attempts: number; createdAt: string } | null> => {
  const key = `otp:${phoneNumber}`;
  const data = await redis.get(key);
  
  if (!data) {
    return null;
  }
  
  return JSON.parse(data);
};

/**
 * Increment failed OTP verification attempts
 */
export const incrementAttempts = async (phoneNumber: string): Promise<number> => {
  const key = `otp:${phoneNumber}`;
  const data = await getOTP(phoneNumber);
  
  if (!data) {
    return 0;
  }
  
  data.attempts++;
  const ttl = await redis.ttl(key);
  
  if (ttl > 0) {
    await redis.setex(key, ttl, JSON.stringify(data));
  }
  
  logger.debug(`OTP attempts incremented for ${phoneNumber}: ${data.attempts}`);
  return data.attempts;
};

/**
 * Delete OTP from Redis
 */
export const deleteOTP = async (phoneNumber: string): Promise<void> => {
  const key = `otp:${phoneNumber}`;
  await redis.del(key);
  logger.debug(`OTP deleted for ${phoneNumber}`);
};

/**
 * Check if OTP exists and is not expired
 */
export const otpExists = async (phoneNumber: string): Promise<boolean> => {
  const key = `otp:${phoneNumber}`;
  const exists = await redis.exists(key);
  return exists === 1;
};

/**
 * Get remaining TTL for OTP
 */
export const getOTPTTL = async (phoneNumber: string): Promise<number> => {
  const key = `otp:${phoneNumber}`;
  return await redis.ttl(key);
};

/**
 * Blacklist a JWT token (for logout)
 */
export const blacklistToken = async (token: string, expiresIn: number): Promise<void> => {
  const key = `blacklist:${token}`;
  await redis.setex(key, expiresIn, '1');
  logger.debug(`Token blacklisted, expires in ${expiresIn}s`);
};

/**
 * Check if a token is blacklisted
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const key = `blacklist:${token}`;
  const result = await redis.get(key);
  return result !== null;
};

/**
 * Rate limiting for OTP requests
 * Returns true if rate limit exceeded
 */
export const checkOTPRateLimit = async (
  phoneNumber: string,
  maxRequests: number = 3,
  windowSeconds: number = 900 // 15 minutes
): Promise<boolean> => {
  const key = `otp-rate:${phoneNumber}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  
  logger.debug(`OTP rate limit for ${phoneNumber}: ${count}/${maxRequests}`);
  return count > maxRequests;
};

/**
 * Get remaining OTP requests for phone number
 */
export const getRemainingOTPRequests = async (
  phoneNumber: string,
  maxRequests: number = 3
): Promise<number> => {
  const key = `otp-rate:${phoneNumber}`;
  const count = await redis.get(key);
  const used = count ? parseInt(count) : 0;
  return Math.max(0, maxRequests - used);
};

/**
 * Store user session data
 */
export const setSession = async (
  userId: string,
  sessionData: any,
  expiresIn: number = 86400 // 24 hours
): Promise<void> => {
  const key = `session:${userId}`;
  await redis.setex(key, expiresIn, JSON.stringify(sessionData));
};

/**
 * Get user session data
 */
export const getSession = async (userId: string): Promise<any | null> => {
  const key = `session:${userId}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Delete user session
 */
export const deleteSession = async (userId: string): Promise<void> => {
  const key = `session:${userId}`;
  await redis.del(key);
};

/**
 * Close Redis connection (for graceful shutdown)
 */
export const closeRedis = async (): Promise<void> => {
  await redis.quit();
  logger.info('Redis connection closed');
};

export default redis;