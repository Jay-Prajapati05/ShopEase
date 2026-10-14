import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Truck,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  Banknote,
} from "lucide-react";
import { useCart } from "../hooks/useCart.js";
import orderApi from "../api/order.api.js";

// Centralized pricing calculation for display estimation only
// (Server calculates and confirms the final binding prices)
const TAX_RATE = 0.05;
const FREE_SHIPPING_MIN = 500;
const FLAT_SHIPPING_FEE = 50;

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Form state
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "India",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Derived estimates for display
  const shippingEstimate = subtotal >= FREE_SHIPPING_MIN ? 0 : FLAT_SHIPPING_FEE;
  const taxEstimate = Math.round(subtotal * TAX_RATE * 100) / 100;
  const totalEstimate = Math.round((subtotal + shippingEstimate + taxEstimate) * 100) / 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error on typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const validate = () => {
    const errs = {};
    if (!shippingAddress.address.trim()) {
      errs.address = "Street address is required";
    }
    if (!shippingAddress.city.trim()) {
      errs.city = "City is required";
    }
    if (!shippingAddress.postalCode.trim()) {
      errs.postalCode = "PIN / Postal code is required";
    } else if (!/^[0-9]{4,10}$/.test(shippingAddress.postalCode.trim())) {
      errs.postalCode = "Please enter a valid postal code";
    }
    if (!shippingAddress.country.trim()) {
      errs.country = "Country is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;
    if (cartItems.length === 0) {
      setServerError("Your cart is empty. Please add items before checking out.");
      return;
    }

    setSubmitting(true);
    try {
      // Build order payload: only productId + qty are sent from the client
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
        },
        paymentMethod: "COD",
      };

      const res = await orderApi.createOrder(payload);
      const createdOrder = res.data?.order;

      // Clear the local cart immediately after successful order creation
      clearCart();

      // Navigate to Order Success page
      navigate(`/order/success/${createdOrder._id}`, {
        state: { order: createdOrder },
        replace: true,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to place order. Please review your details and try again.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
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
        <p className="text-gray-500 mb-6">
          You don't have any items in your cart to place an order.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-brand-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top back link */}
      <div className="mb-6">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Checkout
      </h1>

      {/* Global Server Error Alert */}
      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Unable to place order: </span>
            {serverError}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-6">
          <form id="checkout-form" onSubmit={handleSubmit} noValidate>
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    1. Shipping Address
                  </h2>
                  <p className="text-xs text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Street Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                  >
                    Street Address / Flat / Area *
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="e.g. 123 MG Road, 2nd Floor, Indiranagar"
                    value={shippingAddress.address}
                    onChange={handleChange}
                    disabled={submitting}
                    className={`w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.address
                        ? "border-red-300 focus:ring-red-200 bg-red-50/30"
                        : "border-gray-300 focus:border-brand-500 focus:ring-brand-100"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-600 mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                    >
                      City *
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="e.g. Bangalore"
                      value={shippingAddress.city}
                      onChange={handleChange}
                      disabled={submitting}
                      className={`w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.city
                          ? "border-red-300 focus:ring-red-200 bg-red-50/30"
                          : "border-gray-300 focus:border-brand-500 focus:ring-brand-100"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-600 mt-1">{errors.city}</p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                    >
                      Postal Code / PIN *
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      placeholder="e.g. 560001"
                      value={shippingAddress.postalCode}
                      onChange={handleChange}
                      disabled={submitting}
                      className={`w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.postalCode
                          ? "border-red-300 focus:ring-red-200 bg-red-50/30"
                          : "border-gray-300 focus:border-brand-500 focus:ring-brand-100"
                      }`}
                    />
                    {errors.postalCode && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                  >
                    Country *
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={shippingAddress.country}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 transition-all"
                  />
                  {errors.country && (
                    <p className="text-xs text-red-600 mt-1">{errors.country}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-6">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    2. Payment Method
                  </h2>
                  <p className="text-xs text-gray-500">
                    Choose how you would like to pay
                  </p>
                </div>
              </div>

              {/* COD Option (Active) */}
              <div className="p-4 border-2 border-brand-600 bg-brand-50/30 rounded-xl flex items-start gap-3">
                <div className="mt-0.5 text-brand-600">
                  <CheckCircle2 className="w-5 h-5 fill-brand-600 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      Available
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Pay with cash or UPI directly to our delivery courier when your order arrives.
                  </p>
                </div>
              </div>

              {/* Online Payment placeholder (Phase 8 preview) */}
              <div className="mt-3 p-4 border border-gray-200 bg-gray-50/60 rounded-xl flex items-center justify-between opacity-70">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Credit / Debit Card / UPI / NetBanking
                    </span>
                    <p className="text-[11px] text-gray-400">
                      Online payment gateway
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                  Phase 8 (Coming Soon)
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Order Summary ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
            </h2>

            {/* Items list preview */}
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1 mb-5">
              {cartItems.map((item) => (
                <div key={item.productId} className="py-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.qty} × ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="space-y-2.5 py-4 border-t border-b border-gray-100 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-gray-400" />
                  Estimated Delivery
                </span>
                <span className="font-medium">
                  {shippingEstimate === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    `₹${shippingEstimate}`
                  )}
                </span>
              </div>
              {subtotal < FREE_SHIPPING_MIN && (
                <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2">
                  Add ₹{(FREE_SHIPPING_MIN - subtotal).toLocaleString("en-IN")} more to get FREE delivery!
                </p>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax (5% GST)</span>
                <span className="font-medium text-gray-900">
                  ₹{taxEstimate.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-4 pb-6">
              <span className="text-base font-bold text-gray-900">
                Total Amount
              </span>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-900">
                  ₹{totalEstimate.toLocaleString("en-IN")}
                </span>
                <span className="block text-[10px] text-gray-400 mt-0.5">
                  Calculated and validated by server
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-brand-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  Place Order (COD)
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Trust badge */}
            <div className="mt-4 pt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Safe & Secure Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
