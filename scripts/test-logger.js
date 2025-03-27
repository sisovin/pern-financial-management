import { logger } from "../src/utils/logger.js";
import { asyncLogger } from "../src/utils/asyncLogger.js";

async function testLogger() {
  console.log("Starting logger test...");
  
  // Test basic logging
  logger.debug("Debug message from test script");
  logger.info("Info message from test script");
  logger.warn("Warning message from test script");
  logger.error("Error message from test script", { source: "test-script" });
  
  // Test async logging
  asyncLogger.info("Async info message from test script");
  asyncLogger.error("Async error message from test script");
  
  // Test error logging
  try {
    throw new Error("Test error for logging");
  } catch (error) {
    logger.error("Caught test error in script", {
      error: error.message,
      stack: error.stack,
    });
  }
  
  // Give time for async logs to be processed
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log("Logger test complete. Check your logs directory.");
  process.exit(0);
}

testLogger().catch(err => {
  console.error("Error in test script:", err);
  process.exit(1);
});