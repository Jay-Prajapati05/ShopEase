import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
} from "lucide-react";
import adminApi from "../../api/admin.api.js";

const ORDER_STATUS_OPTIONS = ["Processing", "Shipped", "Delivered", "Cancelled"];

function getStatusBadge(status) {
  switch (status) {
    case "Processing":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" />
          Processing
        </span>
      );
    case "Shipped":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Truck className="w-3 h-3" />
          Shipped
        </span>
      );
    case "Delivered":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-3 h-3" />
          Delivered
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getAllOrders({ page, limit: 10 });
      setOrders(res.data?.orders || []);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      // Update local state smoothly
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                orderStatus: newStatus,
                isPaid: newStatus === "Delivered" ? true : o.isPaid,
              }
            : o
        )
      );
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Could not update status. Transition may not be permitted."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Orders Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review customer purchases, inspect address details, and update dispatch status
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
            <p className="text-xs text-gray-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No orders yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Customer orders will appear here as soon as they checkout.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6">Order ID & Date</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Items Summary</th>
                  <th className="py-3 px-6">Payment</th>
                  <th className="py-3 px-6">Total</th>
                  <th className="py-3 px-6 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const date = new Date(o.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const isTerminal =
                    o.orderStatus === "Delivered" || o.orderStatus === "Cancelled";

                  return (
                    <tr key={o._id} className="hover:bg-gray-50/50 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3.5 px-6">
                        <p className="font-mono font-bold text-xs text-gray-900">
                          #{o._id.slice(-8)}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{date}</p>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-xs sm:text-sm text-gray-900">
                            {o.user?.name || "Guest"}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {o.user?.email || "No email"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {o.shippingAddress?.city}, {o.shippingAddress?.postalCode}
                        </p>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-6">
                        <p className="text-xs font-medium text-gray-800">
                          {o.orderItems?.length}{" "}
                          {o.orderItems?.length === 1 ? "item" : "items"}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate max-w-xs mt-0.5">
                          {o.orderItems?.map((i) => `${i.name} (×${i.qty})`).join(", ")}
                        </p>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium">{o.paymentMethod}</span>
                        </div>
                        <p className="text-[11px] mt-0.5">
                          {o.isPaid ? (
                            <span className="text-green-600 font-semibold">
                              Paid
                              {o.paymentResult?.razorpayPaymentId && (
                                <span className="block font-mono text-[10px] text-gray-500">
                                  {o.paymentResult.razorpayPaymentId}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium">Unpaid</span>
                          )}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-6 font-bold text-gray-900 text-xs sm:text-sm">
                        ₹{o.totalPrice?.toLocaleString("en-IN")}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          {updatingId === o._id && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                          )}

                          {isTerminal ? (
                            getStatusBadge(o.orderStatus)
                          ) : (
                            <select
                              value={o.orderStatus}
                              disabled={updatingId === o._id}
                              onChange={(e) => handleStatusChange(o._id, e.target.value)}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white hover:border-gray-400 outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
                            >
                              {ORDER_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
