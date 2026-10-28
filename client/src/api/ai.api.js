import api from "./axios.js";

/**
 * AI Shopping Assistant API client.
 * Connects to the Express backend endpoint POST /api/ai/chat.
 * Authentication cookies (if user is logged in) are sent automatically by axios.
 * Zero client-side API keys or secret tokens are ever exposed (Security Requirement 1).
 */
export const aiApi = {
  /**
   * Send a query to the AI Shopping Assistant.
   * @param {object} payload
   * @param {string} payload.message - Customer prompt (1-500 characters)
   * @param {Array}  [payload.history] - Up to 10 previous conversation turns [{ role, text }]
   * @returns {Promise<{ reply: string, recommendedProducts: Array }>}
   */
  chat: async ({ message, history = [] }) => {
    const response = await api.post("/ai/chat", { message, history });
    return response.data?.data;
  },
};

export default aiApi;
