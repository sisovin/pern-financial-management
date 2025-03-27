import express from 'express';
import { logger } from '../utils/logger.js';
import { asyncLogger } from '../utils/asyncLogger.js';

const router = express.Router();

/**
 * Test route for verifying logging functionality
 * @route GET /api/test/logging
 */
router.get("/logging", (req, res) => {
  // Test normal logging
  logger.debug("Debug message from test endpoint");
  logger.info("Info message from test endpoint");
  logger.warn("Warning message from test endpoint");

  // Test async logging
  asyncLogger.info("Async info message");

  // Test error logging (but don't crash the app)
  try {
    throw new Error("Test error for logging");
  } catch (error) {
    logger.error("Caught test error", {
      error: error.message,
      stack: error.stack,
    });
  }

  res.json({
    success: true,
    message: "Logging test complete, check your logs",
    requestId: req.id,
  });
});

/**
 * Test route for verifying error handling
 * @route GET /api/test/error
 */
router.get("/error", (req, res, next) => {
  // This will trigger the errorHandler middleware
  next(new Error("Test error from error test endpoint"));
});

/**
 * Test route for measuring response times
 * @route GET /api/test/performance
 */
router.get("/performance", (req, res) => {
  // Simulate a CPU-intensive operation
  const start = Date.now();
  let result = 0;
  for (let i = 0; i < 10000000; i++) {
    result += Math.random();
  }
  
  const duration = Date.now() - start;
  
  res.json({
    success: true,
    message: "Performance test complete",
    duration: `${duration}ms`,
    requestId: req.id,
  });
});

export default router;