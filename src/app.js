import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import cors from "cors";
import "./config/dotenv.js"; // Load env variables first
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
// Add this import with your other route imports
import adminRoutes from "./routes/adminRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import httpLogger, { errorHandler, logger } from "./utils/logger.js";
import rotateLog from "./utils/rotateLog.js";
import { asyncLogger } from "./utils/asyncLogger.js";
import { limiter } from "./middleware/rateLimit.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(httpLogger); // This should be first to log all requests
app.use(express.json());
app.use(limiter); // Apply rate limiter globally (or per route)
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// Log application startup
logger.info("Initializing Express application", {
  environment: process.env.NODE_ENV || "development",
});

// Add this to your app.js before the 404 handler
app.get("/swagger-test", (req, res) => {
  logger.info("Swagger test route accessed");
  res.send("Swagger UI should be available at /api-docs");
});

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, "../docs/swagger.yaml"));
const options = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
};
// Routes for Testing
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, options)
);
// Load Swagger document
console.log("Swagger document loaded:", Object.keys(swaggerDocument)); // Log the loaded Swagger document
app.use("/api/test", testRoutes);

// Routes for Implementation
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes); 

// Default route
app.get("/", (req, res) => {
  logger.info("Default route accessed");
  res.send("Welcome to the PERN Financial Management System API");
});

// 404 handler
app.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestId: req.id,
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
