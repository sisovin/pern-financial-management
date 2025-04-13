import { logger } from "./logger.js";

/**
 * Asynchronous logger with queue system to improve performance
 * Offloads logging operations to avoid blocking the main thread
 */
class AsyncLogger {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.flushInterval = setInterval(() => this.flushQueue(), 1000);
    this.maxQueueSize = 100;
  }

  /**
   * Process the log queue
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    try {
      const batchSize = Math.min(20, this.queue.length);
      const batch = this.queue.splice(0, batchSize);
      
      for (const { level, message, meta } of batch) {
        // Use the synchronous logger directly
        logger[level](message, meta);
      }
    } catch (error) {
      console.error("Error in async logger queue processing:", error);
    } finally {
      this.processing = false;
      
      // If there are more items, continue processing
      if (this.queue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }

  /**
   * Flush the queue periodically
   */
  flushQueue() {
    if (this.queue.length > 0) {
      this.processQueue().catch(err => {
        console.error("Error processing log queue:", err);
      });
    }
  }

  /**
   * Add a log entry to the queue
   */
  log(level, message, meta = {}) {
    // Ensure queue doesn't grow too large (prevent memory leaks)
    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift(); // Remove oldest entry
    }
    
    this.queue.push({ level, message, meta });
    
    // Start processing if not already in progress
    if (this.queue.length === 1) {
      this.processQueue().catch(err => {
        console.error("Error processing log queue:", err);
      });
    }
  }

  /**
   * Helper methods for each log level
   */
  error(message, meta = {}) {
    this.log("error", message, meta);
  }
  
  warn(message, meta = {}) {
    this.log("warn", message, meta);
  }
  
  info(message, meta = {}) {
    this.log("info", message, meta);
  }
  
  http(message, meta = {}) {
    this.log("http", message, meta);
  }
  
  debug(message, meta = {}) {
    this.log("debug", message, meta);
  }
}

export const asyncLogger = new AsyncLogger();