import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ShoppingCart,
  Package,
  Home,
  User,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useCart } from "../../hooks/useCart.js";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const desktopNavLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-150 py-1.5 px-3 rounded-lg ${
      isActive
        ? "text-brand-700 bg-brand-50"
        : "text-gray-700 hover:text-brand-600 hover:bg-gray-50"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      isActive
        ? "bg-brand-50 text-brand-800 border border-brand-200/80 shadow-xs"
        : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs w-full max-w-full">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-15 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:bg-brand-600 transition-colors">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
            </div>
            <span className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              Shop<span className="text-brand-600">Ease</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" end className={desktopNavLinkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={desktopNavLinkClass}>
              Products
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/my-orders" className={desktopNavLinkClass}>
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-gray-500" />
                  My Orders
                </span>
              </NavLink>
            )}

            {isAdmin && (
              <NavLink to="/admin" className={desktopNavLinkClass}>
                <span className="flex items-center gap-1.5 text-brand-700 font-bold">
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </span>
              </NavLink>
            )}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-brand-500 text-gray-950 text-xs font-black rounded-full flex items-center justify-center shadow-xs">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-xl transition-colors"
                  title="My Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 text-brand-800 font-bold text-xs flex items-center justify-center">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {user?.name?.split(" ")[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-brand-600 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold bg-brand-500 text-gray-950 px-4 py-2 rounded-xl hover:bg-brand-600 hover:text-white transition-all shadow-xs hover:shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right items (Cart + Hamburger) - Always visible and flex-shrink-0 */}
          <div className="flex items-center gap-1 md:hidden flex-shrink-0">
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Cart"
              onClick={() => setMobileOpen(false)}
            >
              <ShoppingCart className="w-5 h-5 text-gray-800" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-brand-500 text-gray-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer (Fixed, spacious, vertical stack) */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Profile Card (if authenticated) */}
            {isAuthenticated ? (
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500 text-gray-950 font-black text-sm flex items-center justify-center shadow-xs">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">
                      {user?.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                      {user?.email}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <span className="px-2.5 py-1 bg-brand-100 text-brand-800 font-bold text-[11px] rounded-full uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-brand-50/60 border border-brand-200/60 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-600 mb-3">
                  Sign in for a faster checkout & track your orders
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-2.5 px-3 bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-xl shadow-xs"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-2.5 px-3 bg-brand-500 text-gray-950 text-xs font-black rounded-xl shadow-xs hover:bg-brand-600"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            {/* Vertical Navigation Links */}
            <div className="flex flex-col space-y-1">
              <NavLink
                to="/"
                end
                className={mobileNavLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-gray-500" />
                  <span>Home</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </NavLink>

              <NavLink
                to="/products"
                className={mobileNavLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-gray-500" />
                  <span>Explore Products</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </NavLink>

              <NavLink
                to="/cart"
                className={mobileNavLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-gray-500" />
                  <span>My Cart</span>
                </div>
                {totalItems > 0 ? (
                  <span className="px-2 py-0.5 bg-brand-500 text-gray-950 font-black text-xs rounded-full">
                    {totalItems}
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </NavLink>

              {isAuthenticated && (
                <>
                  <NavLink
                    to="/profile"
                    className={mobileNavLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>My Profile</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </NavLink>

                  <NavLink
                    to="/my-orders"
                    className={mobileNavLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>My Orders</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </NavLink>
                </>
              )}

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={mobileNavLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex items-center gap-3 text-brand-700 font-bold">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Workspace</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-500" />
                </NavLink>
              )}
            </div>

            {/* Logout button (if logged in) */}
            {isAuthenticated && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

