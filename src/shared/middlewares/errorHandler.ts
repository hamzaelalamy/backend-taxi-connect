// src/shared/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import logger from "../../core/logger";

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle 404 errors
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Not found - ${req.originalUrl}`, 404));
};

// Error handling middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error status code
  let statusCode = 500;
  let message = "Something went wrong";
  let stack = process.env.NODE_ENV === "production" ? null : err.stack;

  // If it's our custom AppError, use its properties
  if ("statusCode" in err) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 400;
    message = err.message;
  } else if (err.name === "CastError") {
    // Mongoose bad ObjectId
    statusCode = 400;
    message = "Resource not found";
  } else if (err.name === "JsonWebTokenError") {
    // JWT errors
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your token has expired. Please log in again.";
  }

  // Log error
  logger.error(`${statusCode} - ${message}`, {
    url: req.originalUrl,
    method: req.method,
    error: err,
  });

  // Send response
  res.status(statusCode).json({
    status: statusCode >= 400 && statusCode < 500 ? "fail" : "error",
    message,
    ...(stack && { stack }),
    ...(process.env.NODE_ENV === "development" && { error: err }),
  });
};