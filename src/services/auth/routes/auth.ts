// src/services/auth/routes/auth.ts
import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { validateRequest } from '../../../shared/middlewares/validateRequest';
import { authenticateToken } from '../../../shared/middlewares/auth';
import { rateLimiter } from '../../../shared/middlewares/rateLimiter';

const router = Router();

/**
 * @route   POST /auth/request-otp
 * @desc    Request OTP for phone number
 * @access  Public
 */
router.post(
  '/request-otp',
  rateLimiter.otpRequest, // Rate limit OTP requests
  [
    body('phoneNumber')
      .matches(/^\+212[5-7]\d{8}$/)
      .withMessage('Invalid Moroccan phone number format. Use +212XXXXXXXXX'),
  ],
  validateRequest,
  authController.requestOTP
);

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify OTP and login/register user
 * @access  Public
 */
router.post(
  '/verify-otp',
  rateLimiter.otpVerification, // Rate limit OTP verification
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

/**
 * @route   POST /auth/complete-profile
 * @desc    Complete user profile after registration
 * @access  Private
 */
router.post(
  '/complete-profile',
  authenticateToken,
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

/**
 * @route   POST /auth/register-driver
 * @desc    Register as driver (submit verification documents)
 * @access  Private
 */
router.post(
  '/register-driver',
  authenticateToken,
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

/**
 * @route   GET /auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   PUT /auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticateToken,
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

/**
 * @route   POST /auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Public
 */
router.post(
  '/refresh-token',
  rateLimiter.tokenRefresh, // Rate limit token refresh
  [
    body('token')
      .notEmpty()
      .withMessage('Token is required'),
  ],
  validateRequest,
  authController.refreshToken
);

/**
 * @route   POST /auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   GET /auth/me
 * @desc    Check auth status (verify token)
 * @access  Private
 */
router.get('/me', authenticateToken, authController.checkAuth);

export default router;