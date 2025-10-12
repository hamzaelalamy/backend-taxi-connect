// src/services/auth/routes/auth.ts
import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import validateRequest from '../../../shared/middlewares/validateRequest';
import { protect } from '../../../shared/middlewares/authMiddleware';
import { rateLimiter } from '../../../shared/middlewares/rateLimiter';

const router = Router();

/**
 * PUBLIC ROUTES (No authentication required)
 */

// Request OTP
router.post(
  '/request-otp',
  rateLimiter.otpRequest,
  [
    body('phoneNumber')
      .matches(/^\+212[5-7]\d{8}$/)
      .withMessage('Invalid Moroccan phone number format. Use +212XXXXXXXXX'),
  ],
  validateRequest,
  authController.requestOTP
);

// Verify OTP
router.post(
  '/verify-otp',
  rateLimiter.otpVerification,
  [
    body('phoneNumber')
      .matches(/^\+212[5-7]\d{8}$/)
      .withMessage('Invalid Moroccan phone number format'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP must be a 6-digit number'),
  ],
  validateRequest,
  authController.verifyOTP
);

// Refresh token
router.post(
  '/refresh-token',
  rateLimiter.tokenRefresh,
  [
    body('token')
      .notEmpty()
      .withMessage('Token is required'),
  ],
  validateRequest,
  authController.refreshToken
);

/**
 * PROTECTED ROUTES (Authentication required)
 */

// Complete profile
router.post(
  '/complete-profile',
  protect,
  [
    body('firstName')
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
    body('role')
      .isIn(['passenger', 'driver'])
      .withMessage('Role must be either passenger or driver'),
  ],
  validateRequest,
  authController.completeProfile
);

// Register driver
router.post(
  '/register-driver',
  protect,
  [
    body('licenseNumber')
      .isLength({ min: 5, max: 20 })
      .withMessage('License number must be between 5 and 20 characters'),
    body('licenseExpiryDate')
      .isISO8601()
      .withMessage('Invalid license expiry date format'),
    body('cin')
      .isLength({ min: 8, max: 10 })
      .withMessage('CIN must be between 8 and 10 characters'),
    body('vehicleMake')
      .isLength({ min: 2, max: 50 })
      .withMessage('Vehicle make must be between 2 and 50 characters'),
    body('vehicleModel')
      .isLength({ min: 2, max: 50 })
      .withMessage('Vehicle model must be between 2 and 50 characters'),
    body('vehicleYear')
      .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
      .withMessage('Invalid vehicle year'),
    body('vehiclePlateNumber')
      .isLength({ min: 5, max: 15 })
      .withMessage('Vehicle plate number must be between 5 and 15 characters'),
    body('city')
      .isLength({ min: 2, max: 50 })
      .withMessage('City must be between 2 and 50 characters'),
  ],
  validateRequest,
  authController.registerDriver
);

// Get profile
router.get('/profile', protect, authController.getProfile);

// Update profile
router.put(
  '/profile',
  protect,
  [
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
    body('profilePictureUrl')
      .optional()
      .isURL()
      .withMessage('Invalid profile picture URL'),
  ],
  validateRequest,
  authController.updateProfile
);

// Logout
router.post('/logout', protect, authController.logout);

// Check auth status
router.get('/me', protect, authController.checkAuth);

export default router;
