// src/services/auth/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AppError } from '../../../shared/middlewares/errorHandler';
import logger from '../../../core/logger';

/**
 * Request OTP for phone number
 * POST /auth/request-otp
 */
export const requestOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      throw new AppError('Phone number is required', 400);
    }

    const result = await authService.requestOTP(phoneNumber);

    logger.info(`OTP requested for phone number: ${phoneNumber}`);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and login/register user
 * POST /auth/verify-otp
 */
export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      throw new AppError('Phone number and OTP are required', 400);
    }

    const result = await authService.verifyOTP(phoneNumber, otp);

    logger.info(`User ${result.isNewUser ? 'registered' : 'logged in'}: ${phoneNumber}`);

    res.status(200).json({
      success: true,
      message: result.isNewUser ? 'Account created successfully' : 'Login successful',
      data: {
        token: result.token,
        user: result.user,
        isNewUser: result.isNewUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete user profile after registration
 * POST /auth/complete-profile
 */
export const completeProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { firstName, lastName, email, role } = req.body;

    if (!firstName || !lastName || !role) {
      throw new AppError('First name, last name, and role are required', 400);
    }

    if (!['passenger', 'driver'].includes(role)) {
      throw new AppError('Role must be either passenger or driver', 400);
    }

    const result = await authService.completeProfile(userId, {
      firstName,
      lastName,
      email,
      role,
    });

    logger.info(`Profile completed for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register as driver (submit verification documents)
 * POST /auth/register-driver
 */
export const registerDriver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const {
      licenseNumber,
      licenseExpiryDate,
      cin,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehiclePlateNumber,
      city,
    } = req.body;

    // Validate required fields
    if (!licenseNumber || !licenseExpiryDate || !cin || !vehicleMake || 
        !vehicleModel || !vehicleYear || !vehiclePlateNumber || !city) {
      throw new AppError('All driver registration fields are required', 400);
    }

    // Validate license expiry date
    const expiryDate = new Date(licenseExpiryDate);
    if (expiryDate <= new Date()) {
      throw new AppError('License expiry date must be in the future', 400);
    }

    // Validate vehicle year
    const currentYear = new Date().getFullYear();
    if (vehicleYear < 1990 || vehicleYear > currentYear + 1) {
      throw new AppError('Invalid vehicle year', 400);
    }

    const result = await authService.registerDriver(userId, {
      licenseNumber,
      licenseExpiryDate: expiryDate,
      cin,
      vehicleMake,
      vehicleModel,
      vehicleYear: parseInt(vehicleYear),
      vehiclePlateNumber,
      city,
      documents: req.files || req.body.documents,
    });

    logger.info(`Driver registration submitted for user: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Driver registration submitted successfully. Your documents are under review.',
      data: {
        driver: result.driver,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /auth/profile
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const result = await authService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        profile: result.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /auth/profile
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { firstName, lastName, email, profilePictureUrl } = req.body;

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    const result = await authService.updateProfile(userId, {
      firstName,
      lastName,
      email,
      profilePictureUrl,
    });

    logger.info(`Profile updated for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh JWT token
 * POST /auth/refresh-token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Token is required', 400);
    }

    const result = await authService.refreshToken(token);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /auth/logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const result = await authService.logout(userId);

    logger.info(`User logged out: ${userId}`);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check auth status (protected route to verify token)
 * GET /auth/me
 */
export const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;

    res.status(200).json({
      success: true,
      message: 'Authenticated',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};