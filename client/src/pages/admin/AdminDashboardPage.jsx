import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  PackagePlus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import adminApi from "../../api/admin.api.js";

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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    adminApi
      .getStats()
      .then((res) => {
        if (isMounted) setStats(res.data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err?.response?.data?.message || "Failed to load admin statistics."
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <p className="text-sm text-gray-500 font-medium">
          Loading admin metrics...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error || "Could not retrieve dashboard metrics."}</span>
      </div>
    );
  }

  const { metrics, statusCounts, recentOrders } = stats;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time business performance and operational summary
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-all shadow-sm"
          >
            <PackagePlus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-gray-900">
              ₹{metrics.totalRevenue?.toLocaleString("en-IN")}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Excludes cancelled orders
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-gray-900">
              {metrics.totalOrders}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              All lifetime customer orders
            </p>
          </div>
        </div>

        {/* Registered Users */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Customers
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-gray-900">
              {metrics.totalUsers}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Registered account holders
            </p>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Low Stock Alert
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              metrics.lowStockCount > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400"
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className={`text-2xl font-black ${
              metrics.lowStockCount > 0 ? "text-amber-600" : "text-gray-900"
            }`}>
              {metrics.lowStockCount}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Products with &le; 5 units left
            </p>
          </div>
        </div>
      </div>

      {/* Order Status Distribution Pills */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          Order Status Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-xs font-medium text-amber-700 block">Processing</span>
            <span className="text-xl font-bold text-amber-900 mt-1 block">
              {statusCounts?.Processing || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
            <span className="text-xs font-medium text-blue-700 block">Shipped</span>
            <span className="text-xl font-bold text-blue-900 mt-1 block">
              {statusCounts?.Shipped || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-green-50/70 border border-green-200">
            <span className="text-xs font-medium text-green-700 block">Delivered</span>
            <span className="text-xl font-bold text-green-900 mt-1 block">
              {statusCounts?.Delivered || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200">
            <span className="text-xs font-medium text-red-700 block">Cancelled</span>
            <span className="text-xl font-bold text-red-900 mt-1 block">
              {statusCounts?.Cancelled || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest 5 customer transactions
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            Manage All Orders
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Total</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders?.map((order) => {
                const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-semibold text-xs text-gray-800">
                      #{order._id.slice(-8)}
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="font-medium text-gray-900 text-xs sm:text-sm">
                        {order.user?.name || "Customer"}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {order.user?.email || "N/A"}
                      </p>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-gray-500">{date}</td>
                    <td className="py-3.5 px-6 font-bold text-gray-900 text-xs sm:text-sm">
                      ₹{order.totalPrice?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-6">{getStatusBadge(order.orderStatus)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
