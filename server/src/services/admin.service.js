import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

/**
 * admin.service.js
 *
 * Core business aggregations and metrics for the Admin Dashboard.
 * Rules: Never touches req / res (Rule 3).
 */

/**
 * Aggregate summary metrics across orders, revenue, users, and inventory.
 *
 * @returns {Promise<Object>}
 */
export const getAdminStats = async () => {
  const [
    revenueAgg,
    totalOrders,
    totalUsers,
    totalProducts,
    lowStockCount,
    ordersByStatusAgg,
    recentOrders,
  ] = await Promise.all([
    // 1. Total revenue: sum of totalPrice for all non-cancelled orders
    Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]),

    // 2. Total orders count
    Order.countDocuments(),

    // 3. Total registered users count
    User.countDocuments(),

    // 4. Total products catalog count
    Product.countDocuments(),

    // 5. Low-stock products count (inventory <= 5 units)
    Product.countDocuments({ countInStock: { $lte: 5 } }),

    // 6. Orders count grouped by status (Processing, Shipped, Delivered, Cancelled)
    Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]),

    // 7. Recent 5 orders with populated user info
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .select("-__v")
      .lean(),
  ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

  // Format orders by status into an easy-to-consume dictionary
  const statusCounts = {
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };
  for (const item of ordersByStatusAgg) {
    if (item._id) {
      statusCounts[item._id] = item.count;
    }
  }

  return {
    metrics: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalUsers,
      totalProducts,
      lowStockCount,
    },
    statusCounts,
    recentOrders,
  };
};
