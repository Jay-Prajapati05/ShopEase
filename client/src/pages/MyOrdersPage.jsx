import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShoppingBag,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Star,
  ExternalLink,
} from "lucide-react";
import orderApi from "../api/order.api.js";
import paymentApi from "../api/payment.api.js";
import loadRazorpay from "../utils/loadRazorpay.js";
import { useAuth } from "../hooks/useAuth.js";
import AccountNav from "../components/features/account/AccountNav.jsx";

// Helper to format order status with color, icon, and styling
function getStatusBadge(status) {
  switch (status) {
    case "Processing":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Processing
        </span>
      );
    case "Shipped":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          Shipped
        </span>
      );
    case "Delivered":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-800 border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          Delivered
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [page, setPage] = useState(1);

  const handlePayNow = async (order) => {
    setPaymentError("");
    setPayingOrderId(order._id);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setPaymentError(
          "Failed to load Razorpay SDK. Please check your internet connection."
        );
        setPayingOrderId(null);
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
            await paymentApi.verifyPayment({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            // Mark this order as paid in the state
            setOrders((prev) =>
              prev.map((o) =>
                o._id === order._id
                  ? {
                      ...o,
                      isPaid: true,
                      paidAt: new Date(),
                      paymentResult: {
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                      },
                    }
                  : o
              )
            );
          } catch (err) {
            setPaymentError(
              err?.response?.data?.message || "Payment verification failed."
            );
          } finally {
            setPayingOrderId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setPayingOrderId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failResponse) {
        setPaymentError(failResponse.error?.description || "Payment failed");
        setPayingOrderId(null);
      });
      rzp.open();
    } catch (err) {
      setPaymentError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to initialize payment."
      );
      setPayingOrderId(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    orderApi
      .getMyOrders({ page, limit: 10 })
      .then((res) => {
        if (!isMounted) return;
        setOrders(res.data?.orders || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message || "Failed to load orders. Please refresh."
        );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Unified Account Hub Navigation Header */}
      <AccountNav activeTab="orders" />

      {/* Loading state */}
      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
          <p className="text-xs sm:text-sm text-gray-500 font-semibold">
            Loading your order history...
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && (error || paymentError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs sm:text-sm font-semibold mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{error || paymentError}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-2xs">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-brand-200/60 shadow-xs">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-1.5">
            No Orders Placed Yet
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
            You haven't placed any orders with us yet. Explore our top categories and find great deals today!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 active:scale-95 text-gray-950 font-black text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-xs cursor-pointer"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-5">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden hover:border-gray-300 transition-all"
              >
                {/* 1. Order Card Header Bar */}
                <div className="bg-gray-50/80 border-b border-gray-100 px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">
                        Order Placed
                      </span>
                      <span className="font-bold text-gray-900">{dateStr}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">
                        Order #
                      </span>
                      <span className="font-mono font-bold text-gray-700">
                        {order._id.slice(-8).toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">
                        Total Amount
                      </span>
                      <span className="font-black text-gray-900 text-sm">
                        ₹{order.totalPrice?.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {order.shippingAddress?.city && (
                      <div className="hidden sm:block">
                        <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">
                          Deliver To
                        </span>
                        <span className="font-bold text-gray-700 truncate max-w-[140px] block">
                          {order.shippingAddress.city}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>{getStatusBadge(order.orderStatus)}</div>
                </div>

                {/* 2. Order Items List */}
                <div className="p-5 sm:p-6 divide-y divide-gray-100">
                  {order.orderItems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        <Link
                          to={`/products/${item.product}`}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-50 border border-gray-200/80 shrink-0 overflow-hidden flex items-center justify-center hover:opacity-90 transition group"
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

                          {/* Write Review Link if Delivered */}
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

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                        <span className="text-[11px] text-gray-400 sm:hidden">Item Subtotal:</span>
                        <span className="font-black text-gray-900 text-sm">
                          ₹{(item.price * item.qty)?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. Order Card Bottom Bar: Payment Status & Actions */}
                <div className="px-5 sm:px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500">
                      Payment:{" "}
                      <strong className="text-gray-800">
                        {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online (Razorpay)"}
                      </strong>
                    </span>
                    <span className="text-gray-300">•</span>
                    {order.isPaid ? (
                      <span className="text-green-700 font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Paid
                      </span>
                    ) : order.paymentMethod === "Razorpay" ? (
                      <span className="text-red-700 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                        Payment Pending
                      </span>
                    ) : (
                      <span className="text-amber-800 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        Pay on Delivery
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Pay Now Button (if Razorpay pending and not cancelled) */}
                    {!order.isPaid &&
                      order.paymentMethod === "Razorpay" &&
                      order.orderStatus !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => handlePayNow(order)}
                          disabled={payingOrderId === order._id}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-gray-950 bg-brand-500 hover:bg-brand-400 px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                          {payingOrderId === order._id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Connecting...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Now</span>
                            </>
                          )}
                        </button>
                      )}

                    {/* View Details / Track Shipment */}
                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 px-3.5 py-2 rounded-xl transition shadow-2xs cursor-pointer"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 4. Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 pt-4 select-none">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 font-medium px-2">
                <span>Page</span>
                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                  {pagination.page}
                </span>
                <span>of</span>
                <span className="font-bold text-gray-900">{pagination.totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-1 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
