// src/core/database.ts
import mongoose from "mongoose";
import logger from "./logger";

/**
 * Connect to MongoDB database
 * @param uri MongoDB connection string
 * @returns Mongoose connection instance
 */
const connectDB = async (uri: string): Promise<typeof mongoose> => {
  try {
    if (!uri) {
      throw new Error("MongoDB URI is not defined");
    }
    
    const connection = await mongoose.connect(uri, {
      autoIndex: true,
    });
    
    logger.info("Connected to MongoDB Atlas");
    return connection;
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error; // Re-throw to handle in the calling function
  }
};

export default connectDB;