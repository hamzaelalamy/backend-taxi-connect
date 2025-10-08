// src/core/config.ts

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env file
dotenv.config();

// Define configuration interface
interface Config {
  env: string;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string | number;
  corsOrigin: string | string[];
  maxFileSize: number;
  uploadDir: string;
}

// Check required environment variables
const requiredEnvs = ["MONGO_URI", "JWT_SECRET"];
const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);
if (missingEnvs.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvs.join(", ")}`);
}

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Export configuration
const config: Config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  mongoUri: process.env.MONGO_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10), // 5MB default
  uploadDir
};

export default config;
