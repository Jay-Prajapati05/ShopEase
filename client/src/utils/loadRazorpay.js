/**
 * loadRazorpay.js
 *
 * Dynamically injects the Razorpay Checkout SDK script into document head.
 * Resolves to true when the script is loaded and ready, or false if it fails.
 */
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    // If already loaded in window, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById("razorpay-checkout-js");
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default loadRazorpay;
