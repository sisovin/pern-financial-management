// Redis caching client setup

import redis from "redis";
import "./environment.js"; // Import the centralized env configuration

// Create Redis client
let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis client if not already connected
 * @returns {Promise<Object|null>} Redis client or null if not configured
 */
const initRedisClient = async () => {
  // If already initialized and connected, return existing client
  if (redisClient && isConnected) {
    return redisClient;
  }

  try {
    // Check for either UPSTASH_REDIS_URL or REDIS_URL environment variable
    const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

    if (redisUrl) {
      console.log("Initializing Redis client...");

      // Create new client
      redisClient = redis.createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            const delay = Math.min(retries * 50, 500);
            return delay;
          },
          connectTimeout: 10000, // 10 seconds timeout for connection
        },
      });

      // Set up event handlers for better error handling
      redisClient.on("error", (err) => {
        console.error("Redis client error:", err);
        isConnected = false;
      });

      redisClient.on("connect", () => {
        console.log("Redis client connected");
        isConnected = true;
      });

      redisClient.on("reconnecting", () => {
        console.log("Redis client reconnecting...");
      });

      redisClient.on("end", () => {
        console.log("Redis client connection closed");
        isConnected = false;
      });

      // Connect to Redis
      await redisClient.connect();
      console.log("Redis client initialized successfully");
      return redisClient;
    } else {
      console.log(
        "Redis URL not set (UPSTASH_REDIS_URL or REDIS_URL), Redis features disabled"
      );
      return null;
    }
  } catch (error) {
    console.error("Failed to initialize Redis client:", error);
    return null;
  }
};

/**
 * Gracefully disconnect the Redis client
 * @returns {Promise<void>}
 */
const disconnectRedisClient = async () => {
  if (redisClient && isConnected) {
    try {
      await redisClient.quit();
      console.log("Redis client disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting Redis client:", error);
    } finally {
      redisClient = null;
      isConnected = false;
    }
  }
};

/**
 * Get the current Redis client status
 * @returns {Object} Status information including connection state
 */
const getRedisStatus = () => {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

  return {
    initialized: !!redisClient,
    connected: isConnected,
    url: redisUrl ? redisUrl.replace(/:([^:@]+)@/, ":****@") : null,
  };
};

// Initialize on module load but don't block
initRedisClient().catch(console.error);

// Handle application termination
process.on("SIGINT", async () => {
  await disconnectRedisClient();
});

process.on("SIGTERM", async () => {
  await disconnectRedisClient();
});

export {
  redisClient,
  initRedisClient,
  disconnectRedisClient,
  getRedisStatus,
  isConnected,
};
export default redisClient;
