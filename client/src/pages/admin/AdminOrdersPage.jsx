import { useEffect, useState, useCallback } from "react";
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
  Search,
  X,
  Phone,
  MapPin,
} from "lucide-react";
import adminApi from "../../api/admin.api.js";

const ORDER_STATUS_TABS = [
  { label: "All Orders", value: "" },
  { label: "Processing", value: "Processing" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
];

const ORDER_STATUS_OPTIONS = ["Processing", "Shipped", "Delivered", "Cancelled"];

function getStatusBadge(status) {
  switch (status) {
    case "Processing":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          Processing
        </span>
      );
    case "Shipped":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <Truck className="w-3 h-3 text-blue-600" />
          Shipped
        </span>
      );
    case "Delivered":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-800 border border-green-200">
          <CheckCircle2 className="w-3 h-3 text-green-600" />
          Delivered
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">
          <XCircle className="w-3 h-3 text-red-600" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminApi.getAllOrders(params);
      setOrders(res.data?.orders || []);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleTabChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      // Smooth local state update
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
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Orders Management
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review customer purchases, inspect address details, and update dispatch status
        </p>
      </div>

      {/* 2. Search & Status Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs space-y-4">
        {/* Status Filter Tabs (Horizontal scrolling on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {ORDER_STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap select-none shrink-0 cursor-pointer ${
                  active
                    ? "bg-brand-500 text-gray-950 shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Order ID or phone number..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Main Content Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
            <p className="text-xs text-gray-400 font-semibold">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center px-4">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-800">No matching orders found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {search || statusFilter
                ? "Try clearing your filters or search terms."
                : "Customer orders will appear here as soon as they checkout."}
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW (hidden on mobile < 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-200/80">
                  <tr>
                    <th className="py-3.5 px-6">Order ID & Date</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Items Summary</th>
                    <th className="py-3.5 px-6">Payment</th>
                    <th className="py-3.5 px-6">Total</th>
                    <th className="py-3.5 px-6 text-right">Update Status</th>
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
                          <p className="font-mono font-black text-xs text-gray-900">
                            #{o._id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{date}</p>
                          <div className="mt-1">{getStatusBadge(o.orderStatus)}</div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="font-bold text-xs sm:text-sm text-gray-900 truncate max-w-[140px]">
                              {o.user?.name || "Customer"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[160px]">
                            {o.user?.email || "No email"}
                          </p>
                          {o.shippingAddress?.phone && (
                            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                              📞 +91 {o.shippingAddress.phone}
                            </p>
                          )}
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-6">
                          <p className="font-bold text-xs text-gray-800">
                            {o.orderItems?.length || 0} {o.orderItems?.length === 1 ? "item" : "items"}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate max-w-[180px] mt-0.5">
                            {o.orderItems?.[0]?.name}
                            {o.orderItems?.length > 1 && ` +${o.orderItems.length - 1} more`}
                          </p>
                        </td>

                        {/* Payment */}
                        <td className="py-3.5 px-6">
                          <span className="text-xs font-semibold text-gray-700 block">
                            {o.paymentMethod === "COD" ? "Cash on Delivery" : "Online (Razorpay)"}
                          </span>
                          {o.isPaid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 mt-0.5">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              Paid
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-red-600 mt-0.5 block">
                              Payment Pending
                            </span>
                          )}
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-6">
                          <span className="font-black text-gray-900 text-sm">
                            ₹{o.totalPrice?.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Status Transition Select */}
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            {updatingId === o._id && (
                              <Loader2 className="w-3.5 h-3.5 text-brand-600 animate-spin" />
                            )}
                            <select
                              value={o.orderStatus}
                              onChange={(e) => handleStatusChange(o._id, e.target.value)}
                              disabled={isTerminal || updatingId === o._id}
                              aria-label={`Update status for order ${o._id}`}
                              className="text-xs font-semibold bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {ORDER_STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE TABLE-TO-CARD VIEW (shown on screens < 768px, zero sideways scroll!) */}
            <div className="md:hidden divide-y divide-gray-100">
              {orders.map((o) => {
                const date = new Date(o.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const isTerminal =
                  o.orderStatus === "Delivered" || o.orderStatus === "Cancelled";

                return (
                  <div key={o._id} className="p-4 space-y-3">
                    {/* Top Row: Order ID, Date & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-black text-xs text-gray-900 block">
                          #{o._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-400 block">{date}</span>
                      </div>
                      <div>{getStatusBadge(o.orderStatus)}</div>
                    </div>

                    {/* Customer Info */}
                    <div className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{o.user?.name || "Customer"}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 pl-5 truncate">{o.user?.email}</p>
                      {o.shippingAddress?.phone && (
                        <p className="text-[11px] text-gray-600 pl-5 font-semibold">
                          📞 +91 {o.shippingAddress.phone}
                        </p>
                      )}
                    </div>

                    {/* Items & Payment Info */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-gray-400 text-[11px] block">Items</span>
                        <span className="font-bold text-gray-800">
                          {o.orderItems?.length || 0} items ({o.orderItems?.[0]?.name?.slice(0, 20)}...)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[11px] block">Total Amount</span>
                        <span className="font-black text-gray-900 text-sm">
                          ₹{o.totalPrice?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Status Update Action */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-gray-500">
                        Payment: {o.isPaid ? "Paid" : "Pending"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {updatingId === o._id && (
                          <Loader2 className="w-3 h-3 text-brand-600 animate-spin" />
                        )}
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          disabled={isTerminal || updatingId === o._id}
                          aria-label={`Update mobile status for order ${o._id}`}
                          className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs disabled:opacity-50"
                        >
                          {ORDER_STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* 4. Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50 select-none text-xs">
            <span className="text-gray-500 font-medium hidden sm:inline">
              Showing page <strong className="text-gray-900">{pagination.page}</strong> of{" "}
              <strong className="text-gray-900">{pagination.totalPages}</strong> ({pagination.total} total)
            </span>

            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="font-bold text-gray-900 px-2 sm:hidden">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
