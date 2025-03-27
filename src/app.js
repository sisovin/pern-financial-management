import express from "express";
import cors from "cors";
import "./config/dotenv.js"; // Load env variables first
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import httpLogger, { errorHandler, logger } from "./utils/logger.js"; 
import rotateLog from "./utils/rotateLog.js"; 
import { asyncLogger } from "./utils/asyncLogger.js"; 

const app = express();

// Middleware
app.use(httpLogger); // This should be first to log all requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// Log application startup
logger.info("Initializing Express application", {
  environment: process.env.NODE_ENV || "development"
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/test", testRoutes);

// Default route
app.get("/", (req, res) => {
  logger.info("Default route accessed");
  res.send("Welcome to the PERN Financial Management API");
});

// 404 handler
app.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false,
    message: "Route not found",
    requestId: req.id
  });
});

// Error handler should be last
app.use(errorHandler);

// Rotate logs periodically (every hour)
setInterval(() => {
  rotateLog("./logs");
}, 3600000); // 1 hour interval

// Sample async logging
asyncLogger.info("Application initialized with async logger");

export default app;