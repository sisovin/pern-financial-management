import app from "./src/app.js";
import { connectDB } from "./src/config/database.js";
import { initRedisClient } from "./src/config/redis.js";
import { logger } from "./src/config/logger.js";

// Try different ports if the default is in use
const PORT = process.env.PORT || 5000;
const FALLBACK_PORTS = [5001, 5002, 5003, 5004, 5005];

async function startServer() {
  try {
    logger.info("Starting server initialization");

    // Connect to the database
    logger.info("Connecting to database");
    await connectDB();
    logger.info("Database connection established successfully");

    // Initialize Redis client
    logger.info("Initializing Redis client");
    await initRedisClient();
    logger.info("Redis client initialized successfully");

    // Try to start the server with different ports if needed
    let server;
    let currentPort = PORT;
    let portIndex = 0;

    const startWithPort = (port) => {
      return new Promise((resolve, reject) => {
        const serverInstance = app
          .listen(port)
          .on("listening", () => {
            logger.info("Server started successfully", {
              port: port,
              environment: process.env.NODE_ENV || "development",
              apiUrl: `http://localhost:${port}`,
            });
            resolve(serverInstance);
          })
          .on("error", (err) => {
            if (err.code === "EADDRINUSE") {
              logger.warn(`Port ${port} is in use, trying another port`);
              reject(err);
            } else {
              reject(err);
            }
          });
      });
    };

    try {
      server = await startWithPort(currentPort);
    } catch (err) {
      if (err.code === "EADDRINUSE") {
        // Try fallback ports
        for (const fallbackPort of FALLBACK_PORTS) {
          try {
            server = await startWithPort(fallbackPort);
            currentPort = fallbackPort;
            break;
          } catch (fallbackErr) {
            if (fallbackErr.code !== "EADDRINUSE") {
              throw fallbackErr;
            }
          }
        }

        if (!server) {
          throw new Error("All ports are in use. Unable to start server.");
        }
      } else {
        throw err;
      }
    }

    // Handle graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    // Graceful shutdown signals
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Note: The global exception/rejection handlers are already in logger.js

startServer();
