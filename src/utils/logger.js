import winston from "winston";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import "winston-daily-rotate-file";
import * as Sentry from "@sentry/node";

// Initialize Sentry (only if DSN is provided)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });
}

// Custom Winston Sentry transport
class SentryTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
    this.name = 'sentry';
    this.level = opts.level || 'error';
  }

  log(info, callback) {
    if (!process.env.SENTRY_DSN) {
      callback();
      return;
    }

    const { level, message, ...meta } = info;
    
    if (level === 'error') {
      Sentry.captureException(new Error(message), {
        extra: meta,
      });
    } else {
      Sentry.captureMessage(message, {
        level: Sentry.Severity.fromString(level),
        extra: meta,
      });
    }
    
    callback();
  }
}

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log level selection based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "warn";
};

// Custom log format with structured JSON
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport for all logs
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    ),
  }),
  // Daily rotate file for errors
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: "error",
    format: format,
  }),
  // Daily rotate file for all logs
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: format,
  }),
  // Add Sentry transport (only in production)
  ...(process.env.NODE_ENV === "production" && process.env.SENTRY_DSN
    ? [new SentryTransport({ level: "error" })]
    : []),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// HTTP request logger middleware for Express
const httpLogger = (req, res, next) => {
  // Generate unique request ID
  const requestId = req.id || Math.random().toString(36).substring(2, 15);
  req.id = requestId;

  // Log the request
  logger.http({
    requestId,
    message: `${req.method} ${req.url}`,
    data: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    },
  });

  // Log the response
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? "warn" : "http";

    logger[level]({
      requestId,
      message: `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`,
      data: {
        statusCode: res.statusCode,
        duration,
      },
    });
  });

  next();
};

// Error handler middleware for Express
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error({
    requestId: req.id,
    message: `Error in ${req.method} ${req.url}: ${err.message}`,
    stack: err.stack,
    data: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body,
    },
  });

  // Send response to client
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
    requestId: req.id,
  });
};

// Helper methods with better meta handling
const error = (message, meta = {}) => logger.error(message, { ...meta });
const warn = (message, meta = {}) => logger.warn(message, { ...meta });
const info = (message, meta = {}) => logger.info(message, { ...meta });
const http = (message, meta = {}) => logger.http(message, { ...meta });
const debug = (message, meta = {}) => logger.debug(message, { ...meta });

// Default export for httpLogger middleware
export default httpLogger;

// Named exports for other utilities
export { logger, errorHandler, error, warn, info, http, debug };