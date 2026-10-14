import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Clock,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import orderApi from "../api/order.api.js";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const location = useLocation();

  // If passed from checkout navigation state, use directly; otherwise fetch
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order && id) {
      let isMounted = true;
      setLoading(true);
      orderApi
        .getOrderById(id)
        .then((res) => {
          if (isMounted) setOrder(res.data?.order);
        })
        .catch((err) => {
          if (isMounted) {
            setError(
              err?.response?.data?.message || "Could not retrieve order details."
            );
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [id, order]);

  const copyOrderId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <p className="text-sm text-gray-500 font-medium">
          Loading your order confirmation...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">
          Your order has been recorded with ID:{" "}
          <span className="font-mono font-semibold text-gray-800">{id}</span>
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/my-orders"
            className="bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
          >
            Go to My Orders
          </Link>
          <Link
            to="/products"
            className="border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Success banner card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-sm text-center mb-8">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50">
          <CheckCircle className="w-10 h-10" />
        </div>

        <span className="inline-block text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3">
          Order Placed
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Thank you for your order!
        </h1>

        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          We have received your order. We are preparing it for shipment and will
          collect payment via Cash on Delivery.
        </p>

        {/* Order ID bar */}
        <div className="mt-6 inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-xs sm:text-sm text-gray-700">
          <span className="text-gray-400 font-medium">Order ID:</span>
          <span className="font-mono font-bold text-gray-900">{order._id}</span>
          <button
            onClick={copyOrderId}
            className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-500 hover:text-gray-900 ml-1"
            title="Copy Order ID"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Order Snapshot Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-600" />
          Order Summary
        </h2>

        {/* Grid info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Delivery Address
            </span>
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.postalCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Payment & Status
            </span>
            <div className="space-y-1.5 text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Method:</span>
                <span className="font-semibold text-gray-900">
                  {order.paymentMethod} (Cash on Delivery)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Status:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full text-xs">
                  <Clock className="w-3 h-3" />
                  {order.orderStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items breakdown */}
        <div className="pt-4 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
            Items Ordered ({order.orderItems?.length})
          </span>
          <div className="divide-y divide-gray-100">
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">
                  ₹{(item.price * item.qty).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-gray-100 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Items Subtotal</span>
            <span>₹{order.itemsPrice?.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>
              {order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (GST)</span>
            <span>₹{order.taxPrice?.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 text-base font-bold text-gray-900 border-t border-gray-100">
            <span>Total Payable on Delivery</span>
            <span className="text-xl font-black text-brand-600">
              ₹{order.totalPrice?.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={`/orders/${order._id}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-all shadow-md hover:shadow-lg"
        >
          View Order Tracking
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/my-orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          My All Orders
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-brand-600 font-semibold px-4 py-3 hover:underline text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
