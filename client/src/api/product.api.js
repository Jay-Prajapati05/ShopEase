import api from "./axios.js";

export const productApi = {
  /**
   * Fetch a paginated, filtered product list.
   * @param {Object} params - Query params: page, limit, search, category,
   *                          minPrice, maxPrice, sort, inStock
   */
  getProducts: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data; // { success, data: { products, pagination } }
  },

  /**
   * Fetch a single product by id.
   */
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data; // { success, data: { product } }
  },

  /**
   * Fetch sorted list of all category names.
   */
  getCategories: async () => {
    const response = await api.get("/products/categories");
    return response.data; // { success, data: { categories } }
  },

  /**
   * Fetch review eligibility status for the logged-in user.
   */
  getReviewStatus: async (productId) => {
    const response = await api.get(`/products/${productId}/review-status`);
    return response.data;
  },

  /**
   * Submit a product review.
   * @param {string} productId
   * @param {{ rating: number, comment: string }} reviewData
   */
  createReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  /**
   * Update an existing product review.
   * @param {string} productId
   * @param {{ rating: number, comment: string }} reviewData
   */
  updateReview: async (productId, reviewData) => {
    const response = await api.put(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  /**
   * Delete an existing product review.
   * @param {string} productId
   */
  deleteReview: async (productId) => {
    const response = await api.delete(`/products/${productId}/reviews`);
    return response.data;
  },
};

export default productApi;
