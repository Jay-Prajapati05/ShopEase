import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { isAdminSubdomain, getStorefrontUrl } from "../../utils/subdomain.js";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isSubdomain = isAdminSubdomain();
  const dashboardPath = isSubdomain ? "/" : "/admin";
  const productsPath = isSubdomain ? "/products" : "/admin/products";
  const ordersPath = isSubdomain ? "/orders" : "/admin/orders";
  const usersPath = isSubdomain ? "/users" : "/admin/users";

  const navItems = [
    { label: "Dashboard", path: dashboardPath, icon: LayoutDashboard, end: true },
    { label: "Products", path: productsPath, icon: Package },
    { label: "Orders", path: ordersPath, icon: ShoppingBag },
    { label: "Users", path: usersPath, icon: Users },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between border-b border-gray-800 sticky top-0 z-50">
        {/* Left: Hamburger Menu + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-1.5 -ml-1 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to={dashboardPath} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
              SE
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block leading-none text-white">
                Shop<span className="text-amber-500">Ease</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Admin Control</span>
            </div>
          </Link>
        </div>

        {/* Right: Preview Storefront in New Tab */}
        <a
          href={getStorefrontUrl("/")}
          target="_blank"
          rel="noopener noreferrer"
          title="Preview customer storefront in a new tab"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/60 transition-colors shadow-2xs"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Storefront</span>
          <ExternalLink className="w-3 h-3 text-amber-500/80" />
        </a>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 w-64 h-screen max-h-screen bg-gray-900 text-gray-300 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand header */}
          <Link
            to={dashboardPath}
            title="Admin Dashboard"
            className="h-16 px-6 flex items-center gap-3 border-b border-gray-800 hover:bg-gray-800/40 transition-colors group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block leading-none">
                Shop<span className="text-brand-500">Ease</span>
              </span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mt-1">
                Admin Control
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="p-4 space-y-1 overflow-y-auto flex-1">
            {navItems.map(({ label, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-600 text-white font-semibold shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer actions - pinned at viewport bottom */}
        <div className="p-4 border-t border-gray-800 space-y-2 flex-shrink-0 bg-gray-900">
          <a
            href={getStorefrontUrl("/")}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview customer storefront in a new tab"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-900/60 hover:bg-amber-900/50 hover:text-amber-300 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              <span>Visit Storefront</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-amber-500/70 group-hover:text-amber-400 transition-colors" />
          </a>

          <div className="pt-2 border-t border-gray-800 flex items-center justify-between gap-2">
            <Link
              to="/profile"
              title="View & Edit Profile"
              className="flex items-center gap-2.5 min-w-0 flex-1 p-1.5 rounded-xl hover:bg-gray-800/60 transition-colors cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-full bg-brand-600/30 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-transform select-none">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1 select-none pointer-events-none">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                  {user?.email || ""}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {/* Top bar with Storefront link across all admin pages (Desktop only) */}
        <div className="hidden md:flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <a
              href={getStorefrontUrl("/")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-semibold">Admin Workspace</span>
          </div>

          <a
            href={getStorefrontUrl("/")}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview customer storefront in a new tab"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-brand-700 hover:border-brand-300 transition-all shadow-2xs"
          >
            <Store className="w-3.5 h-3.5 text-brand-600" />
            <span>Visit Storefront</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
