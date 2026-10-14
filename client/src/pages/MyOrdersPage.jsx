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
} from "lucide-react";
import orderApi from "../api/order.api.js";

// Helper to format order status with color and icon
function getStatusBadge(status) {
  switch (status) {
    case "Processing":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          Processing
        </span>
      );
    case "Shipped":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Truck className="w-3.5 h-3.5" />
          Shipped
        </span>
      );
    case "Delivered":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Delivered
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <XCircle className="w-3.5 h-3.5" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and view history for all your past purchases
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading your orders...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-sm text-gray-500 mb-6">
            You haven't placed any orders yet. Discover our latest products and place your first order today!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:border-gray-300 transition-all"
              >
                {/* Order Top Bar */}
                <div className="bg-gray-50/70 border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-gray-400 font-medium block text-[11px] uppercase">
                        Order Placed
                      </span>
                      <span className="font-semibold text-gray-900">{dateStr}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-medium block text-[11px] uppercase">
                        Order ID
                      </span>
                      <span className="font-mono font-semibold text-gray-900">
                        #{order._id}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-medium block text-[11px] uppercase">
                        Total Amount
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{order.totalPrice?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>{getStatusBadge(order.orderStatus)}</div>
                </div>

                {/* Items & Footer */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.orderItems?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
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
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Quantity: {item.qty} × ₹{item.price?.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-gray-900 text-sm">
                            ₹{(item.price * item.qty)?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom details & action */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-xs text-gray-500">
                      Payment Method:{" "}
                      <span className="font-semibold text-gray-800">
                        {order.paymentMethod}
                      </span>{" "}
                      •{" "}
                      {order.isPaid ? (
                        <span className="text-green-600 font-semibold">
                          Paid on {new Date(order.paidAt).toLocaleDateString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          Pay on Delivery
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors"
                    >
                      View Order Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
