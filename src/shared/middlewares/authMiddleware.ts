// src/shared/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";
import User from "../../models/User";
import asyncHandler from "../utils/asyncHandler";
import config from "../../core/config";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to protect routes - validates JWT token and sets user in request
 */
export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get token from Authorization header
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in. Please log in to get access", 401)
      );
    }

    try {
      // 2) Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as {
        id: string;
        email: string;
        role: string;
        iat: number;
        exp: number;
      };

      // 3) Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(
          new AppError("The user belonging to this token no longer exists", 401)
        );
      }

      // 4) Set user in request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      return next(new AppError("Invalid token or token expired", 401));
    }
  }
);

/**
 * Middleware to restrict access based on user role
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

/**
 * Middleware to check if user is verified
 */
export const isVerified = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (!user.isVerified) {
      return next(
        new AppError(
          "Your account is not verified. Please verify your account to continue",
          403
        )
      );
    }

    next();
  }
);
