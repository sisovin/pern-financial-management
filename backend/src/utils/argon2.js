// Argon2 password hashing
import argon2 from "argon2";
import { logger } from "./logger.js";

/**
 * Hash a password using Argon2
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64MB
      timeCost: 3, // 3 iterations
      parallelism: 2, // 2 threads
    });
  } catch (error) {
    // Log detailed error for debugging
    logger.error("Password hashing failed", {
      error: error.message,
      stack: error.stack,
    });

    // Throw a standardized error for higher-level handling
    throw new Error("Password hashing failed");
  }
}

/**
 * Verify a password against a hash
 * @param {string} hash - Stored hashed password
 * @param {string} password - Plain text password to verify
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    // Log detailed error for debugging
    logger.error("Password verification failed", {
      error: error.message,
      stack: error.stack,
    });

    // Throw a standardized error for higher-level handling
    throw new Error("Password verification failed");
  }
}

/**
 * Rehash password if needed (when argon2 parameters change)
 * @param {string} hash - Current password hash
 * @param {string} password - Plain text password
 * @returns {Promise<string|null>} New hash if needed, null otherwise
 */
export async function needsRehash(hash, password) {
  try {
    // First verify the password matches
    const isValid = await verifyPassword(hash, password);
    if (!isValid) return null;

    // Check if rehash is needed
    if (await argon2.needsRehash(hash)) {
      logger.info("Password rehashing required due to parameter changes");
      return await hashPassword(password);
    }

    return null;
  } catch (error) {
    logger.error("Error checking if password needs rehashing", {
      error: error.message,
      stack: error.stack,
    });

    // Return null but don't throw - this is a non-critical operation
    return null;
  }
}
