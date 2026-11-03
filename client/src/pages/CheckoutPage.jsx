import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
} from "lucide-react";
import { useCart } from "../hooks/useCart.js";
import { useAuth } from "../hooks/useAuth.js";
import orderApi from "../api/order.api.js";
import paymentApi from "../api/payment.api.js";
import authApi from "../api/auth.api.js";
import loadRazorpay from "../utils/loadRazorpay.js";
import CheckoutStepper from "../components/features/checkout/CheckoutStepper.jsx";
import CheckoutAddressStep from "../components/features/checkout/CheckoutAddressStep.jsx";
import CheckoutPaymentStep from "../components/features/checkout/CheckoutPaymentStep.jsx";
import CheckoutReviewStep from "../components/features/checkout/CheckoutReviewStep.jsx";

// Pricing calculation for display estimation only
// (Server recalculates and enforces the final binding prices)
const TAX_RATE = 0.05;
const FREE_SHIPPING_MIN = 500;
const FLAT_SHIPPING_FEE = 50;

const emptyAddress = {
  address: "",
  city: "",
  postalCode: "",
  country: "India",
  phone: "",
  altPhone: "",
};

/**
 * CheckoutPage
 *
 * Commercial 3-Step Checkout Wizard:
 * - Step 1: Delivery Address (Auto-fill saved address + inline editor)
 * - Step 2: Payment Method (Instant Online Razorpay vs Cash on Delivery)
 * - Step 3: Order Review & Pay (Voucher code UI, line-items, server price confirmation)
 */
export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard Step State: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState(1);

  // Address state
  const [savedAddress, setSavedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(emptyAddress);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");

  // Submission & error states
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [serverError, setServerError] = useState("");

  // Derived estimates for display
  const shippingEstimate = subtotal >= FREE_SHIPPING_MIN ? 0 : FLAT_SHIPPING_FEE;
  const taxEstimate = Math.round(subtotal * TAX_RATE * 100) / 100;
  const totalEstimate = Math.round((subtotal + shippingEstimate + taxEstimate) * 100) / 100;

  // On mount: fetch saved address from server
  useEffect(() => {
    let isMounted = true;
    const fetchSavedAddress = async () => {
      try {
        setAddressLoading(true);
        const res = await authApi.getSavedAddress();
        const addr = res?.data?.address;
        if (isMounted) {
          if (addr?.address && addr?.city && addr?.phone) {
            setSavedAddress(addr);
            setShippingAddress(addr);
            setIsEditingAddress(false);
          } else {
            setSavedAddress(null);
            setIsEditingAddress(true);
          }
        }
      } catch {
        if (isMounted) {
          setSavedAddress(null);
          setIsEditingAddress(true);
        }
      } finally {
        if (isMounted) setAddressLoading(false);
      }
    };
    fetchSavedAddress();

    return () => {
      isMounted = false;
    };
  }, []);

  const contactPhone = shippingAddress.phone || "";

  // Step 1 ➔ Step 2
  const handleProceedAddress = () => {
    setServerError("");
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 ➔ Step 3
  const handleProceedPayment = () => {
    setServerError("");
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3: Atomic Order Creation + Payment Execution
  const handlePlaceOrder = async () => {
    setServerError("");

    if (cartItems.length === 0) {
      setServerError("Your cart is empty. Please add items before checking out.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Optionally persist address for future orders
      if (saveForFuture) {
        try {
          await authApi.updateSavedAddress(shippingAddress);
        } catch {
          // Silently skip if address save fails
        }
      }

      // 2. Build order payload (only productId + qty sent from client)
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        })),
        shippingAddress: {
          address: shippingAddress.address.trim(),
          city: shippingAddress.city.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: shippingAddress.country.trim(),
          phone: shippingAddress.phone.trim(),
          altPhone: shippingAddress.altPhone ? shippingAddress.altPhone.trim() : "",
        },
        paymentMethod,
      };

      const res = await orderApi.createOrder(payload);
      const createdOrder = res.data?.order;

      if (!createdOrder) throw new Error("Order creation failed on server");

      // 3. If Cash on Delivery, complete immediately
      if (paymentMethod === "COD") {
        clearCart();
        navigate(`/order/success/${createdOrder._id}`, {
          state: { order: createdOrder },
          replace: true,
        });
        return;
      }

      // 4. If Razorpay, initiate online checkout
      setProcessingPayment(true);
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        setSubmitting(false);
        setProcessingPayment(false);
        setServerError(
          "Razorpay SDK failed to load. Please verify your connection or retry from My Orders."
        );
        return;
      }

      const payRes = await paymentApi.createRazorpayOrder(createdOrder._id);
      const payData = payRes.data;

      const options = {
        key: payData.keyId,
        amount: payData.amount,
        currency: payData.currency,
        name: "ShopEase",
        description: `Order #${createdOrder._id.slice(-8)}`,
        order_id: payData.razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: contactPhone,
        },
        theme: { color: "#f59e0b" },
        handler: async function (response) {
          try {
            setProcessingPayment(true);
            const verifyRes = await paymentApi.verifyPayment({
              orderId: createdOrder._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            navigate(`/order/success/${createdOrder._id}`, {
              state: { order: verifyRes.data?.order || createdOrder },
              replace: true,
            });
          } catch (verifyErr) {
            setServerError(
              verifyErr?.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setProcessingPayment(false);
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            setProcessingPayment(false);
            setServerError(
              "Payment window was closed. Your order is saved as 'Unpaid'. You can complete payment anytime from My Orders or click Retry below."
            );
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (failResponse) {
        setSubmitting(false);
        setProcessingPayment(false);
        setServerError(failResponse.error?.description || "Payment failed. Please retry.");
      });
      razorpayInstance.open();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to place order. Please review your details and try again.";
      setServerError(msg);
      setSubmitting(false);
      setProcessingPayment(false);
    }
  };

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6 text-sm">
          You don't have any items in your cart to checkout.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-brand-500 text-gray-950 font-bold px-6 py-2.5 rounded-xl hover:bg-brand-600 transition shadow-xs text-xs sm:text-sm"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Checkout
          </h1>
        </div>
      </div>

      {/* 3-Step Commercial Progress Stepper */}
      <CheckoutStepper
        currentStep={currentStep}
        onStepClick={(step) => {
          setServerError("");
          setCurrentStep(step);
        }}
      />

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Stepper Step */}
        <div className="lg:col-span-7">
          {currentStep === 1 && (
            <CheckoutAddressStep
              shippingAddress={shippingAddress}
              setShippingAddress={setShippingAddress}
              savedAddress={savedAddress}
              addressLoading={addressLoading}
              isEditingAddress={isEditingAddress}
              setIsEditingAddress={setIsEditingAddress}
              saveForFuture={saveForFuture}
              setSaveForFuture={setSaveForFuture}
              onProceed={handleProceedAddress}
            />
          )}

          {currentStep === 2 && (
            <CheckoutPaymentStep
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              subtotal={subtotal}
              onBack={() => setCurrentStep(1)}
              onProceed={handleProceedPayment}
            />
          )}

          {currentStep === 3 && (
            <CheckoutReviewStep
              cartItems={cartItems}
              shippingAddress={shippingAddress}
              paymentMethod={paymentMethod}
              subtotal={subtotal}
              shippingEstimate={shippingEstimate}
              taxEstimate={taxEstimate}
              totalEstimate={totalEstimate}
              onBack={() => setCurrentStep(2)}
              onEditStep={(step) => setCurrentStep(step)}
              onPlaceOrder={handlePlaceOrder}
              submitting={submitting}
              processingPayment={processingPayment}
              serverError={serverError}
              onRetryPayment={handlePlaceOrder}
            />
          )}
        </div>

        {/* Right Column: Persistent Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs sticky top-24 space-y-4">
            <h2 className="text-sm sm:text-base font-black text-gray-950 pb-3 border-b border-gray-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-bold text-gray-500">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </span>
            </h2>

            {/* Compact Items List Preview */}
            <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto no-scrollbar pr-1">
              {cartItems.map((item) => (
                <div key={item.productId} className="py-2.5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-200/70 flex-shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Qty: {item.qty} × ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-xs font-black text-gray-950">
                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2 py-3 border-t border-b border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  Delivery Charges
                </span>
                <span className="font-bold">
                  {shippingEstimate === 0 ? (
                    <span className="text-green-600 font-bold">FREE</span>
                  ) : (
                    `₹${shippingEstimate}`
                  )}
                </span>
              </div>

              {subtotal < FREE_SHIPPING_MIN && (
                <p className="text-[10px] text-amber-800 bg-amber-50 rounded-lg p-2 font-medium">
                  Add ₹{(FREE_SHIPPING_MIN - subtotal).toLocaleString("en-IN")} more to get FREE delivery!
                </p>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Estimated 5% GST</span>
                <span className="font-bold text-gray-900">
                  ₹{taxEstimate.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Final Total Amount */}
            <div className="flex justify-between items-baseline pt-1 pb-2">
              <div>
                <span className="text-sm font-black text-gray-950 block">Total Amount</span>
                <span className="text-[10px] text-gray-400">Inclusive of all taxes</span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black text-gray-950">
                  ₹{totalEstimate.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>100% Safe &amp; Verified Transactions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
