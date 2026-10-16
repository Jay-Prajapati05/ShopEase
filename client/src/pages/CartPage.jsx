import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Package,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { useCart } from "../hooks/useCart.js";
import { useAuth } from "../hooks/useAuth.js";

export default function CartPage() {
  const { cartItems, totalItems, subtotal, updateQty, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10 stroke-1" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Explore our catalog and find great deals!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-brand-700 transition-all shadow-md hover:shadow-lg"
        >
          Browse Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 self-start sm:self-auto hover:underline transition-all"
        >
          Clear entire cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8 items-start">
        {/* Left 2 Cols: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const isAtMaxStock = item.qty >= item.countInStock;

            return (
              <div
                key={item.productId}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:border-gray-200"
              >
                {/* Product Thumbnail */}
                <Link
                  to={`/products/${item.productId}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-300" />
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.productId}`}
                    className="text-base font-semibold text-gray-900 hover:text-brand-600 line-clamp-1 transition-colors"
                  >
                    {item.name}
                  </Link>

                  <p className="text-sm font-medium text-gray-500 mt-1">
                    ₹{item.price.toLocaleString("en-IN")} each
                  </p>

                  {isAtMaxStock && (
                    <span className="inline-block mt-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      Max stock reached ({item.countInStock})
                    </span>
                  )}
                </div>

                {/* Quantity Controls & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                  {/* Quantity selector */}
                  <div className="inline-flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-sm font-semibold text-gray-900 select-none">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      disabled={isAtMaxStock}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-white transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[5rem]">
                    <span className="text-base font-bold text-gray-900 block">
                      ₹{(item.price * item.qty).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Col: Order Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

          <div className="space-y-3 text-sm border-b border-gray-100 pb-4">
            <div className="flex justify-between text-gray-600">
              <span>Items Total ({totalItems})</span>
              <span className="font-medium text-gray-900">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Calculated at checkout</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-base font-bold text-gray-900">Estimated Total</span>
            <div className="text-right">
              <span className="text-2xl font-black text-gray-900">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
              <span className="block text-[11px] text-gray-400 mt-0.5">
                Exact totals confirmed on server at checkout
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 text-gray-950 font-black py-4 px-4 rounded-xl hover:bg-brand-600 hover:text-white transition-all shadow-md hover:shadow-lg text-base"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate("/login", { state: { from: { pathname: "/cart" } } })}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 text-gray-950 font-black py-4 px-4 rounded-xl hover:bg-brand-600 hover:text-white transition-all shadow-md hover:shadow-lg text-base"
              >
                Sign in to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-[11px] text-center text-gray-400">
                Don't have an account?{" "}
                <Link to="/register" className="text-brand-600 hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          )}

          {/* Trust badges */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Safe & Secure 256-bit Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
