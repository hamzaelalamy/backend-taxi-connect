// src/shared/middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler';

/**
 * Rate limiter for OTP requests
 * Limit: 3 requests per 15 minutes per IP
 */
export const otpRequest = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many OTP requests. Please try again in 15 minutes.',
    });
  },
});

/**
 * Rate limiter for OTP verification
 * Limit: 5 requests per 10 minutes per IP
 */
export const otpVerification = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP verification attempts. Please try again in 10 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many OTP verification attempts. Please try again in 10 minutes.',
    });
  },
});

/**
 * Rate limiter for token refresh
 * Limit: 10 requests per 15 minutes per IP
 */
export const tokenRefresh = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many token refresh requests. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many token refresh requests. Please try again in 15 minutes.',
    });
  },
});

/**
 * General API rate limiter
 * Limit: 100 requests per 15 minutes per IP
 */
export const general = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive operations
 * Limit: 20 requests per hour per IP
 */
export const strict = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests. Please try again in 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Export all rate limiters as a group
export const rateLimiter = {
  otpRequest,
  otpVerification,
  tokenRefresh,
  general,
  strict,
};