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
};

export default productApi;
