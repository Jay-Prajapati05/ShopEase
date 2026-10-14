import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();
const adminOnly = [protect, authorize(USER_ROLES.ADMIN)];

// ---------------------------------------------------------------------------
// User routes (logged-in users)
// ---------------------------------------------------------------------------

// POST   /api/orders           — place a new order
router.post("/", protect, createOrder);

// GET    /api/orders/my-orders — the authenticated user's own orders
// NOTE: this literal route MUST be declared before /:id so Express does not
//       try to match "my-orders" as an ObjectId.
router.get("/my-orders", protect, getMyOrders);

// GET    /api/orders/:id       — single order (owner or admin)
router.get("/:id", protect, getOrderById);

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------

// GET    /api/orders           — all orders (paginated)
router.get("/", adminOnly, getAllOrders);

// PUT    /api/orders/:id/status — update status (Processing→Shipped→Delivered|Cancelled)
router.put("/:id/status", adminOnly, updateOrderStatus);

export default router;
