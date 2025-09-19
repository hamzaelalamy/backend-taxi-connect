// src/shared/middlewares/uploadMiddleware.ts
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import config from "../../core/config";
import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const fileExtension = path.extname(file.originalname);
        const fileName = `${Date.now()}-${uuidv4()}${fileExtension}`;

        cb(null, fileName);
    },
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept image files only
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Create multer upload instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.maxFileSize, // 5MB limit from config
    },
});

/**
 * Middleware to handle file upload errors
 */
export const handleUploadErrors = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        // Multer error
        if (err.code === "LIMIT_FILE_SIZE") {
            return next(new AppError(`File too large. Max size is ${config.maxFileSize / 1024 / 1024}MB`, 400));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
    } else if (err) {
        // Other error
        return next(new AppError(err.message, 400));
    }

    // No files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new AppError("No files were uploaded", 400));
    }

    next();
};