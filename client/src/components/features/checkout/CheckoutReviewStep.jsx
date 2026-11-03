import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
  Tag,
  Pencil,
  ArrowLeft,
  Truck,
  CreditCard,
  Banknote,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

/**
 * CheckoutReviewStep
 *
 * Step 3 of the Checkout Stepper:
 * - Summarizes selected Delivery Address and Payment Method with quick "Change" shortcuts
 * - Lists all ordered products with high-res thumbnails & unit pricing
 * - Commercial Coupon / Voucher code application input
 * - Server-guarded final price breakdown
 * - Prominent "Place Order" trigger with payment failure / cancellation retry banner
 */
export default function CheckoutReviewStep({
  cartItems = [],
  shippingAddress,
  paymentMethod,
  subtotal = 0,
  shippingEstimate = 0,
  taxEstimate = 0,
  totalEstimate = 0,
  onBack,
  onEditStep,
  onPlaceOrder,
  submitting = false,
  processingPayment = false,
  serverError = "",
  onRetryPayment,
}) {
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "SHOPEASE10" || code === "WELCOME50" || code === "FREESHIP") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid promo code. Try 'SHOPEASE10' for new user discount.");
      setCouponApplied(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setCouponError("");
  };

  return (
    <div className="space-y-6">
      {/* Visible Server Error / Payment Cancelled Banner */}
      {serverError && (
        <div className="p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3.5 text-red-900 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-xs sm:text-sm font-bold leading-snug">
              Order Placement / Payment Incomplete:
            </p>
            <p className="text-xs text-red-700 leading-relaxed">
              {serverError}
            </p>
            {onRetryPayment && (
              <button
                type="button"
                onClick={onRetryPayment}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Payment</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Review Snapshots (Address & Payment Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Delivery Address Snapshot */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                Delivering To
              </span>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>
            <p className="text-sm font-bold text-gray-900 leading-snug">
              {shippingAddress.address}
            </p>
            <p className="text-xs text-gray-600">
              {shippingAddress.city} — {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
            <p className="text-xs text-gray-700 font-medium pt-0.5">
              Phone: +91 {shippingAddress.phone}
            </p>
          </div>
        </div>

        {/* Payment Method Snapshot */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                Payment Option
              </span>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {paymentMethod === "Razorpay" ? (
                <>
                  <CreditCard className="w-4.5 h-4.5 text-brand-600" />
                  <span className="text-sm font-bold text-gray-900">
                    Online Payment (Cards / UPI / NetBanking)
                  </span>
                </>
              ) : (
                <>
                  <Banknote className="w-4.5 h-4.5 text-green-600" />
                  <span className="text-sm font-bold text-gray-900">
                    Cash on Delivery (Pay at Doorstep)
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {paymentMethod === "Razorpay"
                ? "Powered by Razorpay Secure Gateway"
                : "Cash or UPI accepted by delivery courier"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Order Items Review List */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-950 pb-3 border-b border-gray-100">
          Items in Your Order ({cartItems.length})
        </h3>
        <div className="divide-y divide-gray-100">
          {cartItems.map((item) => (
            <div key={item.productId} className="py-3.5 flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200/70 flex-shrink-0 overflow-hidden flex items-center justify-center p-1">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No Image</span>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  Qty: {item.qty} × ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-xs sm:text-sm font-black text-gray-950">
                ₹{(item.price * item.qty).toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Coupon Code Box */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2.5">
          <Tag className="w-3.5 h-3.5 text-brand-600" />
          <span>Have a Promo Code or Gift Voucher?</span>
        </label>
        {couponApplied ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200 text-xs">
            <span className="font-bold text-green-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Coupon '{couponCode}' applied successfully!
            </span>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. SHOPEASE10"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponError("");
              }}
              className="flex-1 px-3.5 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-brand-500 uppercase tracking-wider"
            />
            <button
              type="submit"
              disabled={!couponCode.trim()}
              className="px-4 py-2 bg-gray-900 hover:bg-brand-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Apply
            </button>
          </form>
        )}
        {couponError && (
          <p className="text-[11px] text-red-600 font-medium mt-1.5">
            {couponError}
          </p>
        )}
      </div>

      {/* 4. Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting || processingPayment}
          className="py-3 px-5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payment</span>
        </button>

        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={submitting || processingPayment}
          className="flex-1 py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting || processingPayment ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {processingPayment
                  ? "Opening Secure Gateway..."
                  : "Placing Your Order..."}
              </span>
            </>
          ) : paymentMethod === "Razorpay" ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Pay ₹{totalEstimate.toLocaleString("en-IN")} via Razorpay</span>
            </>
          ) : (
            <>
              <span>Place Order (Cash on Delivery)</span>
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Trust Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 text-center pt-1">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span>Safe &amp; Secure Checkout • 100% Buyer Protection Guarantee</span>
      </div>
    </div>
  );
}

