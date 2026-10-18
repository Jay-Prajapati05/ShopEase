import Razorpay from "razorpay";

/**
 * Returns a configured Razorpay client instance.
 *
 * Reads credentials from environment variables:
 *   - RAZORPAY_KEY_ID
 *   - RAZORPAY_KEY_SECRET
 *
 * Lazily evaluated so the server can boot in development even before
 * keys are added to .env, while throwing a clean error when payments are initiated.
 */
let razorpayInstance = null;

export const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay credentials missing. Please define RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env"
    );
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayInstance;
};

export default getRazorpayClient;
