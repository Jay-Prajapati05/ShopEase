import rateLimit from "express-rate-limit";

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
