import express from "express";
import cors from "cors";
import "./config/dotenv.js"; // Load env variables first
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import httpLogger, { logger, errorHandler } from "./utils/logger.js"; // Fix the path here

const app = express();

// Middleware
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to PERN Financial Management API" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: true, message: "Route not found" });
});

// Use the error handler middleware from logger.js
app.use(errorHandler);

export default app;
