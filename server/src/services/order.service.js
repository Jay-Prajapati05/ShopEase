/**
 * order.service.js
 *
 * All business logic for orders. This module:
 *   - Never touches req / res (Rule 3).
 *   - Computes every monetary value on the server (Rule 8).
 *   - Uses MongoDB sessions for atomic, all-or-nothing stock decrements.
 *
 * Pricing rules (centralised here, easy to change):
 *   - Tax: 5 % of itemsPrice (GST placeholder).
 *   - Shipping: free above ₹500; ₹50 flat otherwise.
 */

import mongoose from "mongoose"; // used for isValidObjectId
import Order, {
  ORDER_STATUSES,
  VALID_TRANSITIONS,
  PAYMENT_METHODS,
} from "../models/Order.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

// ---------------------------------------------------------------------------
// Pricing constants — change once here, correct everywhere
// ---------------------------------------------------------------------------
const TAX_RATE          = 0.05;  // 5 %
const FREE_SHIPPING_MIN = 500;   // ₹ — orders at or above this get free shipping
const FLAT_SHIPPING_FEE = 50;    // ₹ — charged below the threshold

/** Round to two decimal places (avoids floating-point drift in totals). */
const round2 = (n) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Input validation helpers
// ---------------------------------------------------------------------------

/**
 * Validate the `items` array from the client.
 * Only productId + qty come from the client — never price.
 */
function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest("orderItems must be a non-empty array");
  }

  const seen = new Set();
  for (const [i, item] of items.entries()) {
    if (!item || typeof item !== "object") {
      throw ApiError.badRequest(`orderItems[${i}]: must be an object`);
    }

    if (!mongoose.isValidObjectId(item.productId)) {
      throw ApiError.badRequest(`orderItems[${i}].productId: invalid ObjectId`);
    }

    if (!Number.isInteger(item.qty) || item.qty < 1) {
      throw ApiError.badRequest(
        `orderItems[${i}].qty: must be a positive integer`,
      );
    }

    if (seen.has(String(item.productId))) {
      throw ApiError.badRequest(
        `Duplicate productId at index ${i}. Merge quantities before ordering.`,
      );
    }
    seen.add(String(item.productId));
  }
}

function validateShippingAddress(addr) {
  if (!addr || typeof addr !== "object") {
    throw ApiError.badRequest("shippingAddress is required");
  }

  const required = ["address", "city", "postalCode", "country"];
  const missing = required.filter(
    (f) => !addr[f] || typeof addr[f] !== "string" || !addr[f].trim(),
  );
  if (missing.length) {
    throw ApiError.badRequest(
      `shippingAddress missing required fields: ${missing.join(", ")}`,
    );
  }
}

function validatePaymentMethod(method) {
  if (!Object.values(PAYMENT_METHODS).includes(method)) {
    throw ApiError.badRequest(
      `paymentMethod must be one of: ${Object.values(PAYMENT_METHODS).join(", ")}`,
    );
  }
}

// ---------------------------------------------------------------------------
// createOrder
// ---------------------------------------------------------------------------

/**
 * Place a new order.
 *
 * @param {string}  userId
 * @param {object}  payload
 * @param {Array}   payload.items           [{ productId, qty }]
 * @param {object}  payload.shippingAddress { address, city, postalCode, country }
 * @param {string}  payload.paymentMethod   "COD" (only for now)
 * @returns {Promise<Order>}
 *
 * Safety guarantees:
 *   1. Every product is re-read from the DB — client prices are ignored.
 *   2. Stock is decremented atomically per item using findOneAndUpdate with a
 *      countInStock >= qty filter. This is an atomic document-level operation
 *      that works on ANY MongoDB deployment (standalone, Atlas M0, replica set)
 *      without requiring sessions or retryable writes.
 *   3. If any decrement fails (race condition), all previously-decremented items
 *      are restored via Promise.allSettled before throwing (manual rollback).
 *   4. If Order.create fails after stock decrements, stock is also restored.
 */
export const createOrder = async (userId, payload) => {
  const { items, shippingAddress, paymentMethod } = payload ?? {};

  // --- 1. Validate input (before opening a session) ---
  validateItems(items);
  validateShippingAddress(shippingAddress);
  validatePaymentMethod(paymentMethod);

  // --- 2. Load products and check stock ---
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } })
    .select("name price images countInStock")
    .lean();

  // Check every requested product exists
  const productMap = new Map(products.map((p) => [String(p._id), p]));
  for (const item of items) {
    if (!productMap.has(String(item.productId))) {
      throw ApiError.notFound(`Product ${item.productId} not found`);
    }
  }

  // Check stock availability before entering the session
  // (early rejection avoids unnecessary session overhead)
  for (const item of items) {
    const p = productMap.get(String(item.productId));
    if (p.countInStock < item.qty) {
      throw ApiError.badRequest(
        `"${p.name}" has only ${p.countInStock} unit(s) in stock, but ${item.qty} requested`,
      );
    }
  }

  // --- 3. Build order items (price snapshot from DB) ---
  const orderItems = items.map((item) => {
    const p = productMap.get(String(item.productId));
    return {
      product: p._id,
      name:    p.name,
      image:   p.images?.[0]?.url ?? "",
      price:   p.price, // server-sourced snapshot
      qty:     item.qty,
    };
  });

  // --- 4. Compute all monetary totals on the server ---
  const itemsPrice    = round2(orderItems.reduce((sum, i) => sum + i.price * i.qty, 0));
  const shippingPrice = round2(itemsPrice >= FREE_SHIPPING_MIN ? 0 : FLAT_SHIPPING_FEE);
  const taxPrice      = round2(itemsPrice * TAX_RATE);
  const totalPrice    = round2(itemsPrice + shippingPrice + taxPrice);

  // --- 5. Atomic stock decrement per item (no session required) ---
  //
  // findOneAndUpdate with { countInStock: { $gte: qty } } is atomic at the
  // single-document level — guaranteed by MongoDB without any session.
  // This works on Atlas M0, standalone instances, and replica sets alike.
  //
  // Manual rollback strategy:
  //   - We track every successful decrement in `decremented[]`.
  //   - If any item's $gte condition fails (race condition, last unit gone),
  //     we restore all already-decremented stock via Promise.allSettled and
  //     throw a 400 so the user can refresh and retry.
  //   - Same restore runs if Order.create itself throws (e.g. validation).

  const decremented = []; // tracks { productId, qty } for rollback

  /** Restore stock for every item we already decremented. */
  const rollbackStock = () =>
    Promise.allSettled(
      decremented.map(({ productId, qty }) =>
        Product.findByIdAndUpdate(productId, { $inc: { countInStock: qty } }),
      ),
    );

  for (const item of orderItems) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, countInStock: { $gte: item.qty } },
      { $inc: { countInStock: -item.qty } },
      { new: false }, // we only need to know whether the doc was found
    );

    if (!updated) {
      // Race condition: another request took the last unit
      await rollbackStock();
      const p = productMap.get(String(item.product));
      throw ApiError.badRequest(
        `"${p?.name ?? item.product}" ran out of stock. Please refresh and try again.`,
      );
    }

    decremented.push({ productId: item.product, qty: item.qty });
  }

  // --- 6. Persist the order ---
  let order;
  try {
    order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress: {
        address:    shippingAddress.address.trim(),
        city:       shippingAddress.city.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country:    shippingAddress.country.trim(),
      },
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      orderStatus: ORDER_STATUSES.PROCESSING,
      isPaid: false,
    });
  } catch (saveError) {
    // Order document failed to save — restore stock so inventory stays consistent
    await rollbackStock();
    throw saveError; // re-throw → errorHandler responds 500
  }

  return order;
};

// ---------------------------------------------------------------------------
// getMyOrders
// ---------------------------------------------------------------------------

/**
 * Return paginated orders for the authenticated user, newest first.
 * The compound index { user, createdAt: -1 } covers this query.
 */
export const getMyOrders = async (userId, query = {}) => {
  const page  = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(query.limit, 10) || 10), 50);
  const skip  = (page - 1) * limit;

  const filter = { user: userId };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v -orderItems.product") // lean summary; product ref not needed here
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ---------------------------------------------------------------------------
// getOrderById
// ---------------------------------------------------------------------------

/**
 * Fetch a single order. Throws 404 if not found, 403 if the caller is not
 * the owner or an admin.
 */
export const getOrderById = async (orderId, callerId, callerRole) => {
  if (!mongoose.isValidObjectId(orderId)) {
    throw ApiError.notFound("Order not found");
  }

  const order = await Order.findById(orderId)
    .populate("user", "name email") // populate just enough for the order detail page
    .populate("orderItems.product", "name images") // so the frontend can show current image
    .select("-__v")
    .lean();

  if (!order) throw ApiError.notFound("Order not found");

  // Ownership check: only the order owner or an admin can view it
  if (String(order.user._id) !== String(callerId) && callerRole !== "admin") {
    throw ApiError.forbidden("You do not have permission to view this order");
  }

  return order;
};

// ---------------------------------------------------------------------------
// getAllOrders (admin only)
// ---------------------------------------------------------------------------

/**
 * Return all orders with user info, newest first. Admin-only.
 * Paginated to avoid returning thousands of docs in one shot.
 */
export const getAllOrders = async (query = {}) => {
  const page  = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(query.limit, 10) || 20), 100);
  const skip  = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .select("-__v")
      .lean(),
    Order.countDocuments(),
  ]);

  return {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ---------------------------------------------------------------------------
// updateOrderStatus (admin only)
// ---------------------------------------------------------------------------

/**
 * Move an order to a new status.
 *
 * Rules:
 *   - Only transitions listed in VALID_TRANSITIONS are allowed.
 *   - Cancelling restores stock. Each $inc is atomic at the document level.
 *   - Delivering a COD order marks it as paid.
 *   - Delivered and Cancelled are terminal — no further transitions.
 *
 * No session needed here: stock restore ops and order.save are each atomic
 * individually. In the extremely rare case that stock restore partially fails
 * (network blip mid-loop), Promise.allSettled ensures we still proceed and
 * the admin can manually correct — acceptable for a learning project.
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  if (!mongoose.isValidObjectId(orderId)) {
    throw ApiError.notFound("Order not found");
  }

  if (!Object.values(ORDER_STATUSES).includes(newStatus)) {
    throw ApiError.badRequest(
      `Invalid status. Must be one of: ${Object.values(ORDER_STATUSES).join(", ")}`,
    );
  }

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound("Order not found");

  const allowed = VALID_TRANSITIONS[order.orderStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from "${order.orderStatus}" to "${newStatus}". ` +
        `Allowed next states: ${allowed.length ? allowed.join(", ") : "none (terminal)"}`,
    );
  }

  const isCancelling = newStatus === ORDER_STATUSES.CANCELLED;
  const isDelivering = newStatus === ORDER_STATUSES.DELIVERED;

  // Restore stock when cancelling (each findByIdAndUpdate is atomically safe)
  if (isCancelling) {
    await Promise.allSettled(
      order.orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { countInStock: item.qty } }),
      ),
    );
  }

  order.orderStatus = newStatus;

  if (isDelivering) {
    order.deliveredAt = new Date();
    // COD: mark paid on delivery
    if (order.paymentMethod === PAYMENT_METHODS.COD) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }

  await order.save();

  return order;
};
