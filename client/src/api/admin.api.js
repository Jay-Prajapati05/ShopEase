import api from "./axios.js";

/**
 * admin.api.js
 *
 * Frontend API client for administrative operations:
 *   - Dashboard statistics (revenue, orders, users, low-stock inventory)
 *   - Image uploading via Cloudinary
 *   - Product management (CRUD)
 *   - Order management (all orders, status transitions)
 *   - User management (user list, safe deletion)
 */
export const adminApi = {
  /**
   * Fetch aggregate administrative metrics.
   */
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data; // { success, data: { metrics, statusCounts, recentOrders } }
  },

  /**
   * Upload an image file to Cloudinary.
   * @param {File} file
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // { success, data: { url, public_id } }
  },

  /**
   * Fetch paginated list of all products (for admin management).
   * @param {Object} params - { page, limit, search, category, sort }
   */
  getProducts: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  /**
   * Create a new product.
   * @param {Object} productData
   */
  createProduct: async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  /**
   * Update an existing product.
   * @param {string} id
   * @param {Object} productData
   */
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Delete a product and its associated Cloudinary images.
   * @param {string} id
   */
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  /**
   * Fetch paginated list of all system orders.
   * @param {Object} params - { page, limit }
   */
  getAllOrders: async (params = {}) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  /**
   * Transition order status.
   * @param {string} orderId
   * @param {string} status - Processing | Shipped | Delivered | Cancelled
   */
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  /**
   * Fetch paginated list of all registered users.
   * @param {Object} params - { page, limit }
   */
  getAllUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  /**
   * Delete a user account (cannot be self or last admin).
   * @param {string} userId
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

export default adminApi;
