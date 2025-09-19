// src/server.ts
import createApp from './app';
import config from './core/config';
import connectDB from './core/database';
import logger from './core/logger';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';

/**
 * Initialize server
 */
async function startServer() {
  try {
    // Create required directories
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Set port
    const port = config.port;
    
    // Create Express app
    const app = createApp();
    
    // Connect to database
    if (config.mongoUri) {
      logger.info(`Connecting to MongoDB at ${config.mongoUri.substring(0, 20)}...`);
      await connectDB(config.mongoUri);
      logger.info("Connected to MongoDB");
    } else {
      logger.warn("No MongoDB URI provided, skipping database connection");
    }
    
    // Create HTTP server
    const server = createServer(app);
    
    // Start server
    server.listen(port, () => {
      logger.info(`Server running on port ${port} in ${config.env} mode`);
      logger.info(`API Documentation available at http://localhost:${port}/api-docs`);
    });
    
    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
      
      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    
    // Handle graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
      
      // Force close after 10s
      setTimeout(() => {
        logger.error('Forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();