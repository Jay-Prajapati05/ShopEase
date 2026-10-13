import { Link } from "react-router-dom";
import { ShoppingBag, Github } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <Link to="/register" className="hover:text-brand-600 transition-colors">Register</Link>
            <Link to="/login" className="hover:text-brand-600 transition-colors">Login</Link>
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
