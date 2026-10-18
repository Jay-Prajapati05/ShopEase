import api from "./axios.js";

/**
 * payment.api.js
 *
 * Frontend API client for Razorpay payment operations:
 *   - createRazorpayOrder: POST /payments/create-order
 *   - verifyPayment: POST /payments/verify
 */
export const paymentApi = {
  /**
   * Initializes a Razorpay order on the backend for an existing DB order.
   * @param {string} orderId - MongoDB ObjectId of the order
   * @returns {Promise<object>} { success, data: { orderId, razorpayOrderId, amount, currency, keyId } }
   */
  createRazorpayOrder: async (orderId) => {
    const response = await api.post("/payments/create-order", { orderId });
    return response.data;
  },

  /**
   * Submits Razorpay payment signatures to backend for cryptographic verification.
   * @param {object} payload - { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
   * @returns {Promise<object>} { success, message, data: { order } }
   */
  verifyPayment: async (payload) => {
    const response = await api.post("/payments/verify", payload);
    return response.data;
  },
};

export default paymentApi;
