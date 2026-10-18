/**
 * payment.controller.js
 *
 * Thin adapter between HTTP requests and payment.service.js.
 * Rules:
 *   - No business logic here (Rule 3).
 *   - Passes inputs to service, formats output with ApiResponse.
 */

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as paymentService from "../services/payment.service.js";

// POST /api/payments/create-order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const paymentData = await paymentService.createRazorpayOrder(
    orderId,
    req.user._id
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Razorpay order initialized", paymentData));
});

// POST /api/payments/verify
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
    req.body;

  const order = await paymentService.verifyPayment(orderId, req.user._id, {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Payment verified successfully", { order }));
});
