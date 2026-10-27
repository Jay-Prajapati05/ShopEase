import { useState, useEffect } from "react";
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
  CreditCard,
  Lock,
  Phone,
  Pencil,
  Save,
} from "lucide-react";
import { useCart } from "../hooks/useCart.js";
import { useAuth } from "../hooks/useAuth.js";
import orderApi from "../api/order.api.js";
import paymentApi from "../api/payment.api.js";
import authApi from "../api/auth.api.js";
import loadRazorpay from "../utils/loadRazorpay.js";

// Centralized pricing calculation for display estimation only
// (Server calculates and confirms the final binding prices)
const TAX_RATE = 0.05;
const FREE_SHIPPING_MIN = 500;
const FLAT_SHIPPING_FEE = 50;

const PHONE_REGEX = /^[6-9]\d{9}$/;

const emptyAddress = {
  address: "",
  city: "",
  postalCode: "",
  country: "India",
  phone: "",
  altPhone: "",
};

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Saved address state
  const [savedAddress, setSavedAddress] = useState(null); // null = not loaded yet
  const [addressLoading, setAddressLoading] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(false);

  // Form state — always driven by shippingAddress
  const [shippingAddress, setShippingAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [serverError, setServerError] = useState("");

  // Derived estimates for display
  const shippingEstimate = subtotal >= FREE_SHIPPING_MIN ? 0 : FLAT_SHIPPING_FEE;
  const taxEstimate = Math.round(subtotal * TAX_RATE * 100) / 100;
  const totalEstimate = Math.round((subtotal + shippingEstimate + taxEstimate) * 100) / 100;

  // On mount: fetch saved address from server
  useEffect(() => {
    const fetchSavedAddress = async () => {
      try {
        setAddressLoading(true);
        const res = await authApi.getSavedAddress();
        const addr = res?.data?.address;
        // Consider address "saved" only if required fields are filled
        if (addr?.address && addr?.city && addr?.phone) {
          setSavedAddress(addr);
          setShippingAddress(addr);
          setIsEditingAddress(false);
        } else {
          setSavedAddress(null);
          setIsEditingAddress(true); // no saved address → show form directly
        }
      } catch {
        setSavedAddress(null);
        setIsEditingAddress(true);
      } finally {
        setAddressLoading(false);
      }
    };
    fetchSavedAddress();
  }, []);

  // Prefill Razorpay contact from saved phone
  const contactPhone = shippingAddress.phone || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const validate = () => {
    const errs = {};
    if (!shippingAddress.address.trim()) errs.address = "Street address is required";
    if (!shippingAddress.city.trim()) errs.city = "City is required";
    if (!shippingAddress.postalCode.trim()) {
      errs.postalCode = "PIN / Postal code is required";
    } else if (!/^[0-9]{4,10}$/.test(shippingAddress.postalCode.trim())) {
      errs.postalCode = "Please enter a valid postal code (4–10 digits)";
    }
    if (!shippingAddress.country.trim()) errs.country = "Country is required";
    if (!shippingAddress.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!PHONE_REGEX.test(shippingAddress.phone.trim())) {
      errs.phone = "Enter a valid 10-digit Indian mobile number (starts with 6–9)";
    }
    if (
      shippingAddress.altPhone.trim() &&
      !PHONE_REGEX.test(shippingAddress.altPhone.trim())
    ) {
      errs.altPhone = "Enter a valid 10-digit Indian mobile number (starts with 6–9)";
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
      // Optionally persist address for future orders
      if (saveForFuture) {
        try {
          await authApi.updateSavedAddress(shippingAddress);
        } catch {
          // Non-fatal: silently skip if address save fails
        }
      }

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
          phone: shippingAddress.phone.trim(),
          altPhone: shippingAddress.altPhone.trim(),
        },
        paymentMethod,
      };

      const res = await orderApi.createOrder(payload);
      const createdOrder = res.data?.order;

      if (!createdOrder) throw new Error("Order creation failed on server");

      // If Cash on Delivery, complete immediately
      if (paymentMethod === "COD") {
        clearCart();
        navigate(`/order/success/${createdOrder._id}`, {
          state: { order: createdOrder },
          replace: true,
        });
        return;
      }

      // If Razorpay, initiate online checkout
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
              "Payment window was closed. Your order is saved as 'Unpaid'. You can complete payment anytime from My Orders."
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

  // Saved address banner — shown when address is loaded and user is NOT editing
  const hasSavedAddress = savedAddress && !isEditingAddress;

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
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
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
                {/* Change address toggle */}
                {!addressLoading && savedAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingAddress) {
                        // Cancel edit: revert to saved address
                        setShippingAddress(savedAddress);
                        setErrors({});
                        setSaveForFuture(false);
                      }
                      setIsEditingAddress((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors border border-brand-200 hover:border-brand-400 rounded-lg px-3 py-1.5"
                  >
                    {isEditingAddress ? (
                      <>Cancel</>
                    ) : (
                      <>
                        <Pencil className="w-3.5 h-3.5" />
                        Change Address
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Loading skeleton */}
              {addressLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-10 bg-gray-100 rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-100 rounded-xl" />
                    <div className="h-10 bg-gray-100 rounded-xl" />
                  </div>
                  <div className="h-10 bg-gray-100 rounded-xl" />
                </div>
              ) : hasSavedAddress ? (
                /* ── Saved Address Preview Banner ── */
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-800 mb-1">
                        Delivering to your saved address
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {shippingAddress.address},{" "}
                        {shippingAddress.city} — {shippingAddress.postalCode}
                        <br />
                        {shippingAddress.country}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {shippingAddress.phone}
                        {shippingAddress.altPhone && (
                          <span className="text-gray-400 ml-1">
                            · Alt: {shippingAddress.altPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Editable Address Form ── */
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
                        <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>
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

                  {/* Phone Numbers */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      Contact for Delivery
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Primary Phone */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                        >
                          Phone Number *
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="e.g. 9876543210"
                          maxLength={10}
                          value={shippingAddress.phone}
                          onChange={handleChange}
                          disabled={submitting}
                          className={`w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                            errors.phone
                              ? "border-red-300 focus:ring-red-200 bg-red-50/30"
                              : "border-gray-300 focus:border-brand-500 focus:ring-brand-100"
                          }`}
                        />
                        {errors.phone && (
                          <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                        )}
                      </div>

                      {/* Alternate Phone (optional) */}
                      <div>
                        <label
                          htmlFor="altPhone"
                          className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                        >
                          Alternate Phone{" "}
                          <span className="text-gray-400 font-normal normal-case">
                            (optional)
                          </span>
                        </label>
                        <input
                          id="altPhone"
                          name="altPhone"
                          type="tel"
                          placeholder="e.g. 9123456789"
                          maxLength={10}
                          value={shippingAddress.altPhone}
                          onChange={handleChange}
                          disabled={submitting}
                          className={`w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                            errors.altPhone
                              ? "border-red-300 focus:ring-red-200 bg-red-50/30"
                              : "border-gray-300 focus:border-brand-500 focus:ring-brand-100"
                          }`}
                        />
                        {errors.altPhone && (
                          <p className="text-xs text-red-600 mt-1">{errors.altPhone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Save for future orders checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer mt-1 select-none">
                    <input
                      type="checkbox"
                      id="saveForFuture"
                      checked={saveForFuture}
                      onChange={(e) => setSaveForFuture(e.target.checked)}
                      disabled={submitting}
                      className="w-4 h-4 rounded accent-brand-500"
                    />
                    <span className="text-sm text-gray-600 flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5 text-gray-400" />
                      Save this address for future orders
                    </span>
                  </label>
                </div>
              )}
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

              <div className="space-y-3">
                {/* Razorpay Online Payment Option */}
                <div
                  onClick={() => setPaymentMethod("Razorpay")}
                  className={`p-4 border-2 rounded-xl flex items-start gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === "Razorpay"
                      ? "border-brand-500 bg-brand-50/40 shadow-xs ring-1 ring-brand-400/40"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="mt-0.5">
                    {paymentMethod === "Razorpay" ? (
                      <CheckCircle2 className="w-5 h-5 fill-brand-500 text-white" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-brand-600" />
                        <span className="font-bold text-gray-900 text-sm">
                          Online Payment (Cards / UPI / NetBanking)
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 bg-brand-100 text-brand-800 rounded-full flex-shrink-0">
                        ⚡ Fast &amp; Secure
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Pay instantly via Google Pay, PhonePe, Paytm, Debit/Credit Cards,
                      or NetBanking powered by Razorpay.
                    </p>
                  </div>
                </div>

                {/* COD Option */}
                <div
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 border-2 rounded-xl flex items-start gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === "COD"
                      ? "border-brand-500 bg-brand-50/40 shadow-xs ring-1 ring-brand-400/40"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="mt-0.5">
                    {paymentMethod === "COD" ? (
                      <CheckCircle2 className="w-5 h-5 fill-brand-500 text-white" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-gray-900 text-sm">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 bg-green-100 text-green-800 rounded-full flex-shrink-0">
                        Pay on delivery
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Pay safely with cash or UPI directly to our delivery courier when
                      package arrives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Order Summary ({cartItems.length}{" "}
              {cartItems.length === 1 ? "item" : "items"})
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
                  Add ₹{(FREE_SHIPPING_MIN - subtotal).toLocaleString("en-IN")} more to
                  get FREE delivery!
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
              <span className="text-base font-bold text-gray-900">Total Amount</span>
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
              disabled={submitting || processingPayment || addressLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 text-gray-950 font-black py-4 px-4 rounded-xl hover:bg-brand-600 hover:text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-base active:scale-[0.99] cursor-pointer"
            >
              {submitting || processingPayment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {processingPayment
                    ? "Opening Razorpay Secure Gateway..."
                    : "Placing Order..."}
                </>
              ) : paymentMethod === "Razorpay" ? (
                <>
                  <Lock className="w-4 h-4" />
                  Pay ₹{totalEstimate.toLocaleString("en-IN")} via Razorpay
                </>
              ) : (
                <>
                  Place Order (Cash on Delivery)
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Trust badge */}
            <div className="mt-4 pt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>
                {paymentMethod === "Razorpay"
                  ? "100% Secure 256-Bit Encrypted Payments"
                  : "Safe & Verified Cash on Delivery"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
