 // src/services/auth/services/authService.ts
import jwt from 'jsonwebtoken';
import { User } from '../../../models/User.model';
import { Driver } from '../../../models/Driver.model';
import { Passenger } from '../../../models/Passenger.model';
import config from '../../../core/config';
import { AppError } from '../../../shared/middlewares/errorHandler';
import logger from '../../../core/logger';

// In-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: Date; attempts: number }>();

/**
 * Generate a 6-digit OTP
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate JWT token
 */
const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { id: userId, email, role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );
};

/**
 * Send OTP via SMS (placeholder - integrate with Twilio)
 */
const sendOTP = async (phoneNumber: string, otp: string): Promise<void> => {
  // TODO: Integrate with Twilio or other SMS provider
  logger.info(`OTP for ${phoneNumber}: ${otp}`);
  
  // For development, just log the OTP
  // In production, use Twilio:
  /*
  const twilio = require('twilio')(TWILIO_SID, TWILIO_AUTH_TOKEN);
  await twilio.messages.create({
    body: `Your Taxi-Connect verification code is: ${otp}`,
    from: TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
  */
};

/**
 * Request OTP for phone number
 */
export const requestOTP = async (phoneNumber: string): Promise<{ message: string }> => {
  // Validate phone number format (Moroccan format: +212XXXXXXXXX)
  const phoneRegex = /^\+212[5-7]\d{8}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new AppError('Invalid Moroccan phone number format. Use +212XXXXXXXXX', 400);
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Store OTP
  otpStore.set(phoneNumber, { otp, expiresAt, attempts: 0 });

  // Send OTP via SMS
  await sendOTP(phoneNumber, otp);

  return { message: 'OTP sent successfully' };
};

/**
 * Verify OTP and login/register user
 */
export const verifyOTP = async (
  phoneNumber: string,
  otp: string
): Promise<{ token: string; user: any; isNewUser: boolean }> => {
  // Get stored OTP
  const storedData = otpStore.get(phoneNumber);

  if (!storedData) {
    throw new AppError('OTP not found or expired. Please request a new one', 400);
  }

  // Check expiration
  if (new Date() > storedData.expiresAt) {
    otpStore.delete(phoneNumber);
    throw new AppError('OTP expired. Please request a new one', 400);
  }

  // Check attempts
  if (storedData.attempts >= 3) {
    otpStore.delete(phoneNumber);
    throw new AppError('Too many failed attempts. Please request a new OTP', 400);
  }

  // Verify OTP
  if (storedData.otp !== otp) {
    storedData.attempts++;
    throw new AppError('Invalid OTP', 400);
  }

  // Clear OTP after successful verification
  otpStore.delete(phoneNumber);

  // Find or create user
  let user = await User.findOne({ phoneNumber });
  let isNewUser = false;

  if (!user) {
    // Create new user
    user = await User.create({
      phoneNumber,
      isVerified: true,
      status: 'active',
      role: 'passenger', // Default role
      lastLoginAt: new Date(),
    });
    isNewUser = true;
  } else {
    // Update existing user
    user.lastLoginAt = new Date();
    user.isVerified = true;
    await user.save();
  }

  // Generate token
  const token = generateToken((user._id as any).toString(), user.email || '', user.role);

  return {
    token,
    user: {
      id: user._id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
      profilePictureUrl: user.profilePictureUrl,
    },
    isNewUser,
  };
};

/**
 * Complete user profile after registration
 */
export const completeProfile = async (
  userId: string,
  profileData: {
    firstName: string;
    lastName: string;
    email?: string;
    role: 'passenger' | 'driver';
  }
): Promise<{ user: any }> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update user profile
  user.firstName = profileData.firstName;
  user.lastName = profileData.lastName;
  user.email = profileData.email;
  user.role = profileData.role;
  await user.save();

  // Create role-specific profile
  if (profileData.role === 'passenger') {
    await Passenger.create({
      userId: user._id,
      preferredLanguage: 'ar', // Default to Arabic
      rating: 5.0,
      totalRides: 0,
    });
  }
  // Driver profile will be created when they submit verification documents

  return {
    user: {
      id: user._id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

/**
 * Register as driver (submit verification documents)
 */
export const registerDriver = async (
  userId: string,
  driverData: {
    licenseNumber: string;
    licenseExpiryDate: Date;
    cin: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    vehiclePlateNumber: string;
    city: string;
    documents?: any;
  }
): Promise<{ driver: any }> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if driver profile already exists
  const existingDriver = await Driver.findOne({ userId });
  if (existingDriver) {
    throw new AppError('Driver profile already exists', 400);
  }

  // Create driver profile
  const driver = await Driver.create({
    userId: user._id,
    ...driverData,
    verificationStatus: 'pending',
    isOnline: false,
    currentLocation: {
      type: 'Point',
      coordinates: [0, 0], // Will be updated when driver goes online
    },
    rating: 0,
    totalRides: 0,
    totalEarnings: 0,
  });

  // Update user role
  user.role = 'driver';
  await user.save();

  return {
    driver: {
      id: driver._id,
      userId: driver.userId,
      licenseNumber: driver.licenseNumber,
      vehiclePlateNumber: driver.vehiclePlateNumber,
      verificationStatus: driver.verificationStatus,
    },
  };
};

/**
 * Get current user profile
 */
export const getProfile = async (userId: string): Promise<{ user: any; profile: any }> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  let profile = null;

  if (user.role === 'passenger') {
    profile = await Passenger.findOne({ userId });
  } else if (user.role === 'driver') {
    profile = await Driver.findOne({ userId });
  }

  return {
    user: {
      id: user._id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
      status: user.status,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
    },
    profile,
  };
};

/**
 * Update user profile
 */
export const updateProfile = async (
  userId: string,
  updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePictureUrl?: string;
  }
): Promise<{ user: any }> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update fields
  if (updateData.firstName) user.firstName = updateData.firstName;
  if (updateData.lastName) user.lastName = updateData.lastName;
  if (updateData.email) user.email = updateData.email;
  if (updateData.profilePictureUrl) user.profilePictureUrl = updateData.profilePictureUrl;

  await user.save();

  return {
    user: {
      id: user._id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profilePictureUrl: user.profilePictureUrl,
    },
  };
};

/**
 * Refresh JWT token
 */
export const refreshToken = async (oldToken: string): Promise<{ token: string }> => {
  try {
    const decoded = jwt.verify(oldToken, config.jwtSecret) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const token = generateToken((user._id as any).toString(), user.email || '', user.role);

    return { token };
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
};

/**
 * Logout (can be used to invalidate token on server side if using Redis)
 */
export const logout = async (userId: string): Promise<{ message: string }> => {
  // Update last login
  await User.findByIdAndUpdate(userId, { lastLoginAt: new Date() });

  // In production with Redis, add token to blacklist
  // await redis.set(`blacklist:${token}`, '1', 'EX', JWT_EXPIRES_IN);

  return { message: 'Logged out successfully' };
};