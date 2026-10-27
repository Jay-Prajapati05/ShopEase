import { Router } from "express";
import { handleChat } from "../controllers/ai.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

/**
 * POST /api/ai/chat
 *
 * Publicly accessible AI Shopping Assistant.
 * Middleware pipeline:
 *   1. optionalAuth: identifies authenticated customers without blocking guest visitors.
 *   2. aiLimiter: enforces dual-tier rate limits (20 req / 10m for guests, 40 req / 10m for users).
 *   3. handleChat: controller validates input bounds and invokes aiService.
 */
router.post("/chat", optionalAuth, aiLimiter, handleChat);

export default router;
