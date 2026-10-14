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
} from "lucide-react";
import orderApi from "../api/order.api.js";

// Visual timeline helper
const STATUS_STEPS = ["Processing", "Shipped", "Delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <p className="text-sm text-gray-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h1>
        <p className="text-sm text-gray-500 mb-6">{error || "Order does not exist."}</p>
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Orders
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Orders
        </Link>
      </div>

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Order Details
              </h1>
              <span className="font-mono text-sm font-bold text-gray-500">
                #{order._id}
              </span>
              <button
                onClick={copyOrderId}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-700"
                title="Copy Order ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Placed on <span className="font-medium text-gray-800">{formattedDate}</span>
            </p>
          </div>

          <div>
            {isCancelled ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-red-50 text-red-700 border border-red-200">
                <XCircle className="w-4 h-4" />
                Order Cancelled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-4 h-4" />
                Status: {order.orderStatus}
              </span>
            )}
          </div>
        </div>

        {/* Visual Progress Timeline (if not cancelled) */}
        {!isCancelled ? (
          <div className="pt-8 pb-2">
            <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
              {/* Connecting line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-0">
                <div
                  className="h-full bg-brand-600 transition-all duration-500"
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        isPassed
                          ? "bg-brand-600 text-white shadow-md shadow-brand-100"
                          : "bg-white border-2 border-gray-300 text-gray-400"
                      }`}
                    >
                      {idx === 0 && <Clock className="w-4 h-4" />}
                      {idx === 1 && <Truck className="w-4 h-4" />}
                      {idx === 2 && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isCurrent
                          ? "text-brand-600 font-bold"
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
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm">
            <XCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-semibold">This order has been cancelled.</p>
              <p className="text-xs text-red-600 mt-0.5">
                Items stock has been returned to inventory. If you need assistance, please contact support.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Items Snapshot Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-600" />
              Items in this Order ({order.orderItems?.length})
            </h2>

            <div className="divide-y divide-gray-100 mt-4">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Price snapshot: ₹{item.price?.toLocaleString("en-IN")} × {item.qty}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-gray-900 text-sm">
                      ₹{(item.price * item.qty)?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              Delivery Address
            </h2>

            <div className="mt-4 text-sm text-gray-700 space-y-1">
              <p className="font-semibold text-gray-900">
                {order.user?.name || "Recipient"}
              </p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
              </p>
              <p className="font-medium text-gray-600">
                {order.shippingAddress?.country}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Price Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              Payment Information
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Method</span>
                <span className="font-semibold text-gray-900">
                  {order.paymentMethod === "COD" ? "Cash on Delivery (COD)" : order.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Status</span>
                {order.isPaid ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Paid on {new Date(order.paidAt).toLocaleDateString("en-IN")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    Pay upon Delivery
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
              Payment Summary
            </h2>

            <div className="space-y-3 py-4 text-sm text-gray-600 border-b border-gray-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₹{order.itemsPrice?.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-medium">
                  {order.shippingPrice === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    `₹${order.shippingPrice}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax (5% GST)</span>
                <span className="font-medium text-gray-900">
                  ₹{order.taxPrice?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-4">
              <span className="text-base font-bold text-gray-900">
                Total Payable
              </span>
              <span className="text-2xl font-black text-brand-600">
                ₹{order.totalPrice?.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Certified Server-Side Snapshot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
