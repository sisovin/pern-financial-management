import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import { logger } from "../utils/logger.js";

// Initialize Redis client with connection error handling
let redisClient;
let redisAvailable = false;

try {
  redisClient = new Redis(process.env.REDIS_URL);

  redisClient.on("connect", () => {
    redisAvailable = true;
    logger.info("Redis connected successfully for rate limiting");
    // Re-initialize the rate limiter with Redis if connected after initial setup
    if (!rateLimiterInitializedWithRedis) {
      initializeRateLimiterWithRedis();
    }
  });

  redisClient.on("error", (err) => {
    redisAvailable = false;
    logger.error("Redis connection error", { error: err.message });
  });
} catch (error) {
  logger.error("Failed to initialize Redis client", { error: error.message });
}

let rateLimiterInitializedWithRedis = false;

/**
 * Creates a rate limiter middleware with customizable options
 * @param {Object} options - Customization options for the rate limiter
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    trustProxy: true, // Trust X-Forwarded-For header if behind a proxy
    windowMs: 15 * 60 * 1000, // 15 minutes
    // Default key generator that uses IP address
    keyGenerator: (req) => req.ip,
    max: (req) => {
      if (req.user?.isPremium) return 500;
      if (req.user) return 200;
      return 50; // Unauthenticated users
    }, // Limit each IP to 50 requests per windowMs
    standardHeaders: "draft-7", // Latest specification
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count successful requests
    skipFailedRequests: false, // Count failed requests
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, path: ${req.path}`);

      // Set Retry-After header before sending response
      res.set("Retry-After", Math.ceil(options.windowMs / 1000));

      res.status(429).json({
        success: false,
        error: "Too Many Requests",
        message: `You have exceeded the rate limit. Please try again after ${Math.ceil(
          options.windowMs / 1000 / 60
        )} minutes.`,
      });
    },
    skip: (req) => {
      // Skip rate limiting for health/status endpoints
      return req.path === "/api/health" || req.path === "/api/status";
    },
    // Removed deprecated onLimitReached option
  };

  // Only use Redis store if Redis is available
  if (redisAvailable && redisClient) {
    try {
      defaultOptions.store = new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        client: redisClient,
        prefix: "rl:", // Add prefix to distinguish rate limiting keys in Redis
      });
      rateLimiterInitializedWithRedis = true;
      logger.info("Using Redis store for rate limiting");
    } catch (error) {
      logger.error("Failed to initialize Redis store", {
        error: error.message,
      });
    }
  } else {
    logger.warn("Redis unavailable, using memory store for rate limiting");
  }

  // Merge default options with user-provided options
  const limiterOptions = { ...defaultOptions, ...options };

  return rateLimit(limiterOptions);
};

/**
 * Initializes rate limiter with Redis after connection is established
 */
function initializeRateLimiterWithRedis() {
  if (redisAvailable && redisClient) {
    try {
      // Re-initialize the limiter with Redis store
      limiter = createRateLimiter();
      logger.info("Rate limiter re-initialized with Redis store");
    } catch (error) {
      logger.error("Failed to re-initialize rate limiter with Redis", {
        error: error.message,
      });
    }
  }
}

// Default rate limiter instance
let limiter = createRateLimiter();

// Export for use in other routes
export { limiter, createRateLimiter, redisClient };
export default limiter;
