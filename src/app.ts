// src/app.ts
import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import swaggerUi from "swagger-ui-express";

// Import configurations and utilities
import config from "./core/config";
import swaggerSpec from "./core/swagger";
import logger from "./core/logger";
import {
  errorHandler,
  notFoundHandler,
} from "./shared/middlewares/errorHandler";

// Import service routes
import authRoutes from './services/auth/routes/auth';
// import carRoutes from "./services/cars/routes";
// import locationRoutes from "./services/locations/routes";
// import userRoutes from "./services/users/routes";
// import propertyRoutes from "./services/properties/routes";

/**
 * Creates and configures Express application
 */
const createApp = (): Express => {
  const app: Express = express();

  // CORS setup
  app.use(
      cors({
        origin: config.corsOrigin,
        credentials: true,
      })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api", limiter);

  // HTTP request logging
  if (config.env === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(
        morgan("combined", {
          stream: {
            write: (message: string) => logger.info(message.trim()),
          },
        })
    );
  }

  // Body parser middleware
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // Static files
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // API documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Base route - can be removed in production
  app.get("/", (req, res) => {
    res.send("Taxi-Connect API is running");
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "API is healthy",
      environment: config.env,
      timestamp: new Date().toISOString(),
    });
  });

  // Test route
  app.get("/api/test", (req, res) => {
    res.status(200).json({ status: "success", message: "Test route works!" });
  });

  // Mount service routes
  app.use('/api/v1/auth', authRoutes);
  // app.use("/api/cars", carRoutes); // Monter les routes des voitures
  // app.use("/api/locations", locationRoutes);
  // app.use("/api/users", userRoutes);
  // app.use("/api/properties", propertyRoutes);

  // Handle 404 errors
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export default createApp;