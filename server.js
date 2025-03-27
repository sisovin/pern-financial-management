import app from "./src/app.js"; // Changed from { app } to app
import { connectDB } from "./src/config/db.js";
import { initRedisClient } from "./src/config/redis.js";
import { logger } from "./src/utils/logger.js"; // Fixed import path

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    logger.info("Starting server initialization");
    
    // Connect to the database
    logger.debug("Connecting to database");
    await connectDB();
    logger.info("Database connection established successfully");

    // Initialize Redis client
    logger.debug("Initializing Redis client");
    await initRedisClient();
    logger.info("Redis client initialized successfully");

    // Start Express server
    app.listen(PORT, () => {
      logger.info("Server started successfully", {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        apiUrl: `http://localhost:${PORT}`
      });
    });
  } catch (error) {
    logger.error("Failed to start server", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    reason: reason.message || reason,
    stack: reason.stack || 'No stack trace available'
  });
  process.exit(1);
});

logger.info("Initializing application", {
  nodeEnv: process.env.NODE_ENV || "development",
  port: PORT
});

startServer();
