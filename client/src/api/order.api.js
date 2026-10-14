import api from "./axios.js";

/**
 * order.api.js
 *
 * Frontend API client for order endpoints:
 *   - createOrder: POST /orders
 *   - getMyOrders: GET /orders/my-orders
 *   - getOrderById: GET /orders/:id
 */
export const orderApi = {
  /**
   * Place a new order with COD.
   * @param {Object} orderData - { items: [{ productId, qty }], shippingAddress: { address, city, postalCode, country }, paymentMethod: "COD" }
   */
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data; // { success, statusCode, message, data: { order } }
  },

  /**
   * Fetch logged-in user's orders (newest first, paginated).
   * @param {Object} params - { page, limit }
   */
  getMyOrders: async (params = {}) => {
    const response = await api.get("/orders/my-orders", { params });
    return response.data; // { success, statusCode, data: { orders, pagination } }
  },

  /**
   * Fetch a single order by ID (owner or admin).
   * @param {string} orderId
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data; // { success, statusCode, data: { order } }
  },
};

export default orderApi;
