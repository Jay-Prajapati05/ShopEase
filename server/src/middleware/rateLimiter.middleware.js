import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * Standard rate-limit error handler matching ShopEase's error response structure.
 */
const createRateLimitHandler = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    statusCode: 429,
    message,
    errors: [],
  });
};

/**
 * General API Limiter:
 * Allows up to 500 requests per 15 minutes per IP for general browsing and API consumption.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many requests from this IP. Please try again after 15 minutes."),
});

/**
 * Strict Auth Limiter:
 * Restricts sensitive auth operations (login, register, forgot/reset password)
 * to 20 attempts per 15 minutes per IP to block brute-force and credential stuffing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many authentication attempts. Please try again after 15 minutes."),
});

/**
 * AI Assistant Rate Limiter (Security Requirement 4):
 * Protects Gemini quota, wallet costs, and prevents automated DoS.
 * - Guests: max 20 queries per 10 minutes per IP (IPv6 normalized via ipKeyGenerator).
 * - Authenticated Customers: max 40 queries per 10 minutes per user ID.
 */
export const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: (req) => (req.user ? 40 : 20),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user ? `ai_user_${req.user._id}` : ipKeyGenerator(req.ip)),
  handler: createRateLimitHandler(
    "AI assistant query limit reached. Please wait a few minutes before sending more messages."
  ),
});
