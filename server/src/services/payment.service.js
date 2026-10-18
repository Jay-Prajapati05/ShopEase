/**
 * payment.service.js
 *
 * Business logic for Razorpay payment processing.
 * Rules:
 *   - Never touches req / res (Rule 3).
 *   - Recalculates and reads amount strictly from the server DB in paise (Rule 8).
 *   - Cryptographically verifies Razorpay signature with timing-safe comparison.
 *   - Idempotent: verifying an already verified order returns the order without side-effects.
 */

import crypto from "crypto";
import mongoose from "mongoose";
import Order, { ORDER_STATUSES, PAYMENT_METHODS } from "../models/Order.js";
import ApiError from "../utils/ApiError.js";
import { getRazorpayClient } from "../config/razorpay.js";

/**
 * Creates a Razorpay Order for an existing unpaid DB order.
 *
 * @param {string} orderId - MongoDB ObjectId of the order
 * @param {string} userId - Authenticated user's ID
 * @returns {Promise<object>} Razorpay order parameters & public Key ID
 */
export const createRazorpayOrder = async (orderId, userId) => {
  if (!orderId || !mongoose.isValidObjectId(orderId)) {
    throw ApiError.badRequest("Invalid order ID");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  // Ensure only the order owner can pay for it
  if (order.user.toString() !== userId.toString()) {
    throw ApiError.forbidden("Access denied: you do not own this order");
  }

  if (order.isPaid) {
    throw ApiError.badRequest("Order has already been paid");
  }

  if (order.orderStatus === ORDER_STATUSES.CANCELLED) {
    throw ApiError.badRequest("Cannot pay for a cancelled order");
  }

  // Razorpay accepts amounts in paise (1 INR = 100 paise)
  // Re-read strictly from DB total (the client never specifies payment amount)
  const amountInPaise = Math.round(order.totalPrice * 100);

  if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
    throw ApiError.badRequest("Invalid order total amount");
  }

  const razorpay = getRazorpayClient();

  // Short receipt identifier (max 40 chars per Razorpay spec)
  const receipt = `rcpt_${order._id.toString().slice(-16)}`;

  try {
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    return {
      orderId: order._id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      customer: {
        name: order.shippingAddress?.address || "",
      },
    };
  } catch (err) {
    throw ApiError.badRequest(
      err?.error?.description || err?.message || "Failed to initialize Razorpay order"
    );
  }
};

/**
 * Verifies Razorpay HMAC-SHA256 signature and marks order as paid.
 *
 * @param {string} orderId - MongoDB ObjectId of the order
 * @param {string} userId - Authenticated user's ID
 * @param {object} paymentPayload - { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * @returns {Promise<object>} Updated paid Order document
 */
export const verifyPayment = async (orderId, userId, paymentPayload = {}) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentPayload;

  if (!orderId || !mongoose.isValidObjectId(orderId)) {
    throw ApiError.badRequest("Invalid order ID");
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw ApiError.badRequest(
      "Missing required payment verification parameters (razorpayOrderId, razorpayPaymentId, razorpaySignature)"
    );
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  if (order.user.toString() !== userId.toString()) {
    throw ApiError.forbidden("Access denied: you do not own this order");
  }

  // Idempotency: If this order was already verified with this payment ID, return it safely
  if (
    order.isPaid &&
    order.paymentResult?.razorpayPaymentId === razorpayPaymentId
  ) {
    return order;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured on the server");
  }

  // Recompute expected HMAC-SHA256 signature:
  // expectedSignature = HMAC_SHA256(razorpayOrderId + "|" + razorpayPaymentId, secret)
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // Timing-safe comparison to protect against timing attacks
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(razorpaySignature, "utf8");

  let isSignatureValid = false;
  if (expectedBuffer.length === receivedBuffer.length) {
    isSignatureValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  }

  if (!isSignatureValid) {
    throw ApiError.badRequest("Payment signature verification failed");
  }

  // Update order payment status
  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentMethod = PAYMENT_METHODS.RAZORPAY;
  order.paymentResult = {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  };

  await order.save();
  return order;
};
