import { Link, useLocation } from "react-router-dom";
import {
  Package,
  User,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth.js";

/**
 * AccountNav
 *
 * Unified sub-navigation header for ShopEase Customer Account Hub.
 * Renders on /profile, /my-orders, and /orders/:id.
 */
export default function AccountNav({ activeTab = "profile" }) {
  const { user } = useAuth();
  const location = useLocation();

  // Compute initials (e.g., "Jay Prajapati" -> "JP")
  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "Recent";

  const NAV_ITEMS = [
    {
      id: "orders",
      label: "My Orders",
      to: "/my-orders",
      icon: Package,
      isActive: location.pathname.startsWith("/my-orders") || location.pathname.startsWith("/orders/"),
    },
    {
      id: "profile",
      label: "Personal Info",
      to: "/profile?tab=profile",
      icon: User,
      isActive: location.pathname === "/profile" && activeTab === "profile",
    },
    {
      id: "address",
      label: "Saved Addresses",
      to: "/profile?tab=address",
      icon: MapPin,
      isActive: location.pathname === "/profile" && activeTab === "address",
    },
    {
      id: "security",
      label: "Security & Password",
      to: "/profile?tab=security",
      icon: ShieldCheck,
      isActive: location.pathname === "/profile" && activeTab === "security",
    },
  ];

  return (
    <div className="mb-6 sm:mb-8 space-y-4">
      {/* 1. Customer Profile Banner Card */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md border border-gray-800/80 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Initials Avatar */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-gray-950 font-black text-lg sm:text-xl flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
              {getInitials(user?.name)}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">
                  {user?.name || "Customer"}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  <Sparkles className="w-3 h-3 text-brand-400" />
                  <span>{user?.role === "admin" ? "Admin" : "Verified Customer"}</span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                <span className="truncate flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  {user?.email}
                </span>
                <span className="hidden sm:inline text-gray-600">•</span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  Member since {formattedDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Unified Tab Navigation (Desktop pills, Mobile horizontal scrolling rail) */}
      <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap select-none shrink-0 cursor-pointer ${
                active
                  ? "bg-brand-500 text-gray-950 shadow-xs scale-[1.02]"
                  : "bg-white border border-gray-200/80 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-gray-950 stroke-[2.2]" : "text-gray-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

