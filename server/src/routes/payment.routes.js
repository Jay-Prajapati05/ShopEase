/**
 * payment.routes.js
 *
 * Express routes for Razorpay payment operations.
 * All endpoints require authentication (protect middleware).
 */

import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = Router();

// POST /api/payments/create-order
router.post("/create-order", protect, createRazorpayOrder);

// POST /api/payments/verify
router.post("/verify", protect, verifyPayment);

export default router;
