// src/shared/middlewares/validateRequest.ts
import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { AppError } from "./errorHandler";

/**
 * Middleware to validate request using express-validator
 * @param validations array of validation chains from express-validator
 */
const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Get first error message for each field
      const errorMessages = errors
        .array()
        .reduce((acc: Record<string, string>, error: any) => {
          if (!acc[error.path]) {
            acc[error.path] = error.msg;
          }
          return acc;
        }, {});

      // Return validation error with all field errors
      return next(
        new AppError(
          "Validation failed: " + Object.values(errorMessages).join(", "),
          400
        )
      );
    }

    next();
  };
};

export default validateRequest;
