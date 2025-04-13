// Signup, login, JWT, 2FA
import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resetPassword,
    requestPasswordReset,
    getUserProfile, 
    updateUserProfile
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

// For public routes (IP-based)
const publicKeyGenerator = (req) => req.ip;

// For authenticated routes (user ID-based)
const userKeyGenerator = (req) => req.user?.id || req.ip;

// For sensitive routes (composite key)
const sensitiveKeyGenerator = (req) => {
  // Include IP even for auth users to prevent token sharing
  return `${req.user?.id || 'anon'}_${req.ip}`;
};

// Create specialized rate limiters
const publicLimiter = createRateLimiter({ 
  max: 20, 
  windowMs: 10 * 60 * 1000,
  keyGenerator: publicKeyGenerator 
});

// Create specialized rate limiters with keyGenerator
const authLimiter = createRateLimiter({ 
  max: 10, 
  windowMs: 10 * 60 * 1000,
  keyGenerator: (req) => req.ip // Add the keyGenerator function here
});

const userLimiter = createRateLimiter({ 
  max: 200, 
  windowMs: 10 * 60 * 1000,
  keyGenerator: (req) => req.user?.id || req.ip, // Add the keyGenerator function here
});

const sensitiveActionLimiter = createRateLimiter({ 
  max: 5, 
  windowMs: 10 * 60 * 1000,
  keyGenerator: sensitiveKeyGenerator
});

// Public routes with strict limits
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, publicLimiter, login);
router.post("/refresh-token", authLimiter, refreshToken);
router.post("/request-password-reset", authLimiter, sensitiveActionLimiter, requestPasswordReset);
router.post("/reset-password", authLimiter, sensitiveActionLimiter, resetPassword);
// More RESTful API design
router.post("/reset-password/:token", authLimiter, sensitiveActionLimiter, resetPassword);
router.post("/verify-email", authLimiter, verifyEmail);

// Protected routes with more generous limits
router.post("/logout", authenticate, userLimiter, logout);

// Add a GET route for retrieving profile (more RESTful)
router.get("/user-profile", authenticate, userLimiter, getUserProfile);
router.post("/user-profile", authenticate, userLimiter, getUserProfile);
router.post("/update-profile", authenticate, userLimiter, updateUserProfile);

export default router;