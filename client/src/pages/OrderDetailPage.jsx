import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Star,
  ExternalLink,
  Phone,
  RotateCcw,
} from "lucide-react";
import orderApi from "../api/order.api.js";
import paymentApi from "../api/payment.api.js";
import loadRazorpay from "../utils/loadRazorpay.js";
import { useAuth } from "../hooks/useAuth.js";
import AccountNav from "../components/features/account/AccountNav.jsx";

// Visual timeline helper
const STATUS_STEPS = ["Processing", "Shipped", "Delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePayNow = async () => {
    if (!order) return;
    setPaymentError("");
    setPaying(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setPaymentError(
          "Failed to load Razorpay SDK. Please check your internet connection."
        );
        setPaying(false);
        return;
      }

      const payRes = await paymentApi.createRazorpayOrder(order._id);
      const payData = payRes.data;

      const options = {
        key: payData.keyId,
        amount: payData.amount,
        currency: payData.currency,
        name: "ShopEase",
        description: `Order #${order._id.slice(-8)}`,
        order_id: payData.razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: order.shippingAddress?.phone || "",
        },
        theme: {
          color: "#f59e0b",
        },
        handler: async function (response) {
          try {
            const verifyRes = await paymentApi.verifyPayment({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setOrder(verifyRes.data?.order || { ...order, isPaid: true, paidAt: new Date() });
          } catch (err) {
            setPaymentError(
              err?.response?.data?.message || "Payment verification failed."
            );
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failResponse) {
        setPaymentError(failResponse.error?.description || "Payment failed");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setPaymentError(
        err?.response?.data?.message || err?.message || "Failed to start payment."
      );
      setPaying(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    orderApi
      .getOrderById(id)
      .then((res) => {
        if (!isMounted) return;
        setOrder(res.data?.order);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message ||
            "Unable to load order details. Please check the order ID."
        );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const copyOrderId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <p className="text-xs sm:text-sm text-gray-500 font-bold">Loading shipment details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-gray-900 mb-1.5">Order Not Found</h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">{error || "The requested order does not exist."}</p>
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-gray-950 font-black px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === "Cancelled";
  const currentStepIndex = STATUS_STEPS.indexOf(order.orderStatus);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Unified Account Hub Navigation Header */}
      <AccountNav activeTab="orders" />

      {/* Back button & Breadcrumb */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-5 sm:p-7 shadow-2xs mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <span className="font-mono text-xs font-semibold text-gray-400 hidden sm:inline">
                ({order._id})
              </span>
              <button
                type="button"
                onClick={copyOrderId}
                className="p-1 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700 cursor-pointer"
                title="Copy Full Order ID"
                aria-label="Copy Full Order ID"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Placed on <strong className="text-gray-800">{formattedDate}</strong>
            </p>
          </div>

          <div>
            {isCancelled ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                <XCircle className="w-4 h-4 text-red-600" />
                Order Cancelled
              </span>
            ) : order.orderStatus === "Delivered" ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Delivered Successfully
              </span>
            ) : order.orderStatus === "Shipped" ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Truck className="w-4 h-4 text-blue-600" />
                On the Way (Shipped)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-4 h-4 text-amber-600" />
                Processing Order
              </span>
            )}
          </div>
        </div>

        {/* Visual Progress Timeline (if not cancelled) */}
        {!isCancelled ? (
          <div className="pt-8 pb-4">
            <div className="relative flex items-center justify-between max-w-xl mx-auto px-4">
              {/* Connecting line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0">
                <div
                  className="h-full bg-brand-500 transition-all duration-500"
                  style={{
                    width:
                      currentStepIndex === 0
                        ? "0%"
                        : currentStepIndex === 1
                        ? "50%"
                        : "100%",
                  }}
                />
              </div>

              {STATUS_STEPS.map((stepName, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={stepName} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-xs ${
                        isPassed
                          ? "bg-brand-500 text-gray-950 font-black shadow-brand-500/20"
                          : "bg-white border-2 border-gray-300 text-gray-400"
                      }`}
                    >
                      {idx === 0 && <Clock className="w-4 h-4" />}
                      {idx === 1 && <Truck className="w-4 h-4" />}
                      {idx === 2 && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[11px] sm:text-xs mt-2 font-bold ${
                        isCurrent
                          ? "text-brand-700 font-black"
                          : isPassed
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {stepName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs sm:text-sm">
            <XCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-bold">This order has been cancelled.</p>
              <p className="text-xs text-red-600 mt-0.5">
                Items have been returned to warehouse stock.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Items & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Items Snapshot Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs">
            <h2 className="text-sm sm:text-base font-black text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-600" />
              Items in this Order ({order.orderItems?.length})
            </h2>

            <div className="divide-y divide-gray-100 mt-2">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <Link
                      to={`/products/${item.product}`}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-50 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center hover:opacity-90 transition group"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                      )}
                    </Link>

                    <div className="min-w-0">
                      <Link
                        to={`/products/${item.product}`}
                        className="font-bold text-gray-900 text-xs sm:text-sm hover:text-brand-600 transition truncate block"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: <strong className="text-gray-800">{item.qty}</strong> × ₹
                        {item.price?.toLocaleString("en-IN")}
                      </p>

                      {order.orderStatus === "Delivered" && (
                        <Link
                          to={`/products/${item.product}#reviews`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline mt-1.5"
                        >
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>Write a Review</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-gray-900 text-xs sm:text-sm">
                      ₹{(item.price * item.qty)?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs">
            <h2 className="text-sm sm:text-base font-black text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              Delivery Shipping Address
            </h2>

            <div className="mt-4 text-xs sm:text-sm space-y-1.5 text-gray-700">
              <p className="font-bold text-gray-900">{order.shippingAddress?.address}</p>
              <p className="text-gray-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
              </p>
              <p className="text-gray-500">{order.shippingAddress?.country || "India"}</p>

              {order.shippingAddress?.phone && (
                <div className="pt-2 mt-2 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>Contact: +91 {order.shippingAddress.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Price Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Status Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs">
            <h2 className="text-sm sm:text-base font-black text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              Payment Information
            </h2>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Method</span>
                <span className="font-bold text-gray-900">
                  {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online via Razorpay"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Payment Status</span>
                {order.isPaid ? (
                  <span className="inline-flex items-center gap-1 font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" />
                    Paid
                  </span>
                ) : order.paymentMethod === "Razorpay" ? (
                  <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
                    <AlertCircle className="w-3 h-3" />
                    Payment Pending
                  </span>
                ) : (
                  <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                    Pay on Delivery
                  </span>
                )}
              </div>

              {order.isPaid && order.paidAt && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500">Paid At</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(order.paidAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}

              {/* Pay Now Retry Button if unpaid */}
              {!order.isPaid &&
                order.paymentMethod === "Razorpay" &&
                !isCancelled && (
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={paying}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-brand-500 hover:bg-brand-400 active:scale-95 text-gray-950 font-black text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {paying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Connecting to Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Complete Payment Now</span>
                        </>
                      )}
                    </button>
                    {paymentError && (
                      <p className="text-[11px] text-red-600 mt-2 font-semibold text-center">
                        {paymentError}
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Price Breakdown Summary */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs">
            <h2 className="text-sm sm:text-base font-black text-gray-900 pb-3 border-b border-gray-100">
              Order Summary
            </h2>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ₹{order.itemsPrice?.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <span>Delivery Charges</span>
                {order.shippingPrice === 0 ? (
                  <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                    FREE
                  </span>
                ) : (
                  <span className="font-semibold text-gray-900">
                    ₹{order.shippingPrice?.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <span>Applicable Taxes (GST 5%)</span>
                <span className="font-semibold text-gray-900">
                  ₹{order.taxPrice?.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm sm:text-base font-black text-gray-900">
                <span>Total Amount</span>
                <span className="text-brand-700">
                  ₹{order.totalPrice?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Trust Guarantee Card */}
          <div className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl text-xs text-gray-600 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900">100% Purchase Protection</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                Enjoy safe payments, genuine products directly verified from catalog, and a 7-day hassle-free replacement policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
