import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  Search,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useCart } from "../../hooks/useCart.js";

/**
 * Navbar
 *
 * Flipkart-style commercial e-commerce header:
 * - Brand logo
 * - Live delivery location selector ("Deliver to: ...")
 * - Prominent global search bar with direct catalog discovery
 * - User authentication & account management
 * - Responsive mobile drawer with dedicated mobile search
 */
export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync search input if user arrived via search query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    } else if (location.pathname !== "/products") {
      setSearchQuery("");
    }
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setMobileOpen(false);
    } else {
      navigate("/products");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/login");
  };

  // Derive readable location label from user profile address
  const deliveryLocation = user?.address?.city
    ? `${user.address.city}${user.address.postalCode ? ` ${user.address.postalCode}` : ""}`
    : user?.address?.postalCode
    ? `PIN ${user.address.postalCode}`
    : "Select location";

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-2xs w-full max-w-full">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-16 sm:h-20">
          {/* Left: Brand Logo & Delivery Location */}
          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:bg-brand-600 transition-colors">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-950" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                  Shop<span className="text-brand-600">Ease</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                  Explore Plus
                </span>
              </div>
            </Link>

            {/* Delivery Location Selector (Desktop) */}
            <Link
              to={isAuthenticated ? "/profile" : "/login"}
              className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left"
              title="Change Delivery Location"
            >
              <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Deliver to
                </span>
                <span className="text-xs font-bold text-gray-800 truncate max-w-[120px]">
                  {deliveryLocation}
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Global Search Bar (Flipkart Style) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-2xl relative"
          >
            <div className="relative w-full flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Products, Brands, and More..."
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all shadow-inner placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Right: Actions (Orders, Admin, Profile, Cart) */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Orders shortcut for logged in users */}
            {isAuthenticated && (
              <Link
                to="/my-orders"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-brand-700 hover:bg-gray-50 py-2 px-3 rounded-xl transition-all"
              >
                <Package className="w-4 h-4 text-gray-500" />
                <span>Orders</span>
              </Link>
            )}

            {/* Admin shortcut for admins */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-800 bg-brand-50 border border-brand-200/80 py-1.5 px-3 rounded-xl hover:bg-brand-100 transition-all shadow-2xs"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-700" />
                <span>Admin</span>
              </Link>
            )}

            {/* Account / Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-xl border border-transparent hover:border-gray-200 transition-all"
                  title="My Account"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500 text-gray-950 font-black text-xs flex items-center justify-center shadow-xs">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 truncate max-w-[100px]">
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
                  className="text-xs sm:text-sm font-bold text-gray-800 hover:text-brand-600 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-black bg-brand-500 text-gray-950 px-4 py-2 rounded-xl hover:bg-brand-600 transition-all shadow-xs"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Cart Button with Count Badge */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-gray-800 hover:bg-brand-50 hover:text-brand-800 transition-colors flex items-center gap-1.5 ml-1"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs font-bold hidden lg:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-brand-500 text-gray-950 text-[11px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Right: Cart & Drawer Toggle */}
          <div className="flex items-center gap-1.5 md:hidden flex-shrink-0">
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-gray-800 hover:bg-gray-100 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-900" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-brand-500 text-gray-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="p-2 rounded-xl text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Always visible on mobile below brand row) */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for Products, Brands, and More..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Delivery location banner */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
              <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>
                Deliver to: <strong className="text-gray-900">{deliveryLocation}</strong>
              </span>
            </div>

            {/* Profile summary */}
            {isAuthenticated ? (
              <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-4 flex items-center justify-between">
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
                    className="w-full py-2.5 px-3 bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-xl shadow-xs text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-2.5 px-3 bg-brand-500 text-gray-950 text-xs font-black rounded-xl shadow-xs text-center"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            {/* Drawer Navigation Links */}
            <div className="flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-gray-500" />
                  <span>Home</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/products"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-gray-500" />
                  <span>All Categories & Deals</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/my-orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>My Orders</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>My Profile & Addresses</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-brand-800 bg-brand-50/50"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 text-brand-700" />
                    <span>Admin Panel</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-500" />
                </Link>
              )}
            </div>

            {/* Logout */}
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
