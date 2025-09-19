// src/shared/utils/asyncHandler.ts
import { Request, Response, NextFunction } from "express";

/**
 * Wrapper for async route handlers to catch errors and pass them to next()
 * This eliminates the need for try/catch blocks in each controller
 */
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;