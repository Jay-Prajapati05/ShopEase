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
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Orders", path: "/admin/orders", icon: ShoppingBag },
  { label: "Users", path: "/admin/users", icon: Users },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between border-b border-gray-800 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-sm">
            SE
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight block leading-none">
              Shop<span className="text-brand-500">Ease</span>
            </span>
            <span className="text-[10px] text-gray-400">Back to Store</span>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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
            to="/"
            title="Go to customer storefront"
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
            {NAV_ITEMS.map(({ label, path, icon: Icon, end }) => (
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
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-brand-400 bg-brand-950/50 border border-brand-900/60 hover:bg-brand-900/50 hover:text-brand-300 transition-colors"
          >
            <Store className="w-4 h-4 text-brand-400" />
            Back to Store
          </Link>

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
                  {user?.name || "Admin"}
                </p>
                <p className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                  {user?.email || "admin@shopease.com"}
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
        {/* Top bar with Storefront link across all admin pages */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Link
              to="/"
              className="text-brand-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <Store className="w-3.5 h-3.5" />
              Storefront
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-semibold">Admin Workspace</span>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-brand-700 hover:border-brand-300 transition-all shadow-2xs"
          >
            <Store className="w-3.5 h-3.5 text-brand-600" />
            Back to Store
          </Link>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
