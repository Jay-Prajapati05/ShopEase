/**
 * order.controller.js
 *
 * Thin adapter between HTTP and order.service.js.
 * Rules:
 *   - No business logic here.
 *   - Reads from req, calls the service, sends ApiResponse.
 *   - asyncHandler catches any thrown ApiError and forwards to errorHandler.
 */

import * as orderService from "../services/order.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  const order = await orderService.createOrder(req.user._id, {
    items,
    shippingAddress,
    paymentMethod,
  });

  res.status(201).json(new ApiResponse(201, "Order placed successfully", { order }));
});

// GET /api/orders/my-orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const { orders, pagination } = await orderService.getMyOrders(
    req.user._id,
    req.query,
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Orders fetched", { orders, pagination }));
});

// GET /api/orders/:id  (owner or admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user._id,
    req.user.role,
  );

  res.status(200).json(new ApiResponse(200, "Order fetched", { order }));
});

// GET /api/orders  (admin only)
export const getAllOrders = asyncHandler(async (req, res) => {
  const { orders, pagination } = await orderService.getAllOrders(req.query);

  res
    .status(200)
    .json(new ApiResponse(200, "All orders fetched", { orders, pagination }));
});

// PUT /api/orders/:id/status  (admin only)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || typeof status !== "string") {
    throw ApiError.badRequest("status field is required");
  }

  const order = await orderService.updateOrderStatus(req.params.id, status.trim());

  res
    .status(200)
    .json(new ApiResponse(200, `Order status updated to "${order.orderStatus}"`, { order }));
});
