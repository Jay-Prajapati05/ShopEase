import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">
              Shop<span className="text-brand-600">Ease</span>
            </span>
          </div>

          {/* Links (Auth-Aware) */}
          <nav className="flex items-center gap-5 sm:gap-6 text-xs sm:text-sm text-gray-500">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-brand-600 transition-colors">Products</Link>
            {isAuthenticated ? (
              <>
                <Link to="/my-orders" className="hover:text-brand-600 transition-colors">My Orders</Link>
                <Link to="/cart" className="hover:text-brand-600 transition-colors">Cart</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="hover:text-brand-600 transition-colors">Register</Link>
                <Link to="/login" className="hover:text-brand-600 transition-colors">Login</Link>
              </>
            )}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-gray-400">
            &copy; {year} ShopEase. Built with MERN Stack.
          </p>
        </div>
      </div>
    </footer>
  );
}
