import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Lock, Mail, Eye, EyeOff, Loader2, ExternalLink } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { isAdminSubdomain, getStorefrontUrl } from "../../utils/subdomain.js";

/**
 * AdminLoginPage.jsx
 *
 * Dedicated, restricted enterprise login portal for ShopEase Administrators.
 * Exclusively active on admin subdomains / admin portal mode.
 *
 * Security & Separation:
 * - Strictly rejects non-admin users with 403 Forbidden Access Denied.
 * - Zero customer registration or shopping catalog UI.
 * - Auto-terminates session if a non-admin attempts login.
 */
export default function AdminLoginPage() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  const navigate = useNavigate();
  const isSubdomain = isAdminSubdomain();
  const dashboardPath = isSubdomain ? "/" : "/admin";

  // If already authenticated as admin, jump straight to the dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, dashboardPath]);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your administrator credentials.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(form);
      const loggedUser = res?.data?.user;

      // Strict Administrator Role Guard
      if (loggedUser?.role !== "admin") {
        await logout();
        setError(
          "Access Denied: This portal is strictly restricted to ShopEase Administrators. Your account does not have admin privileges."
        );
        return;
      }

      // Successful admin login -> navigate to admin dashboard
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || "Invalid administrator credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-950 text-gray-100 selection:bg-amber-600 selection:text-white">
      <div className="w-full max-w-md">
        {/* Security Warning Pill */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Restricted Access • Authorized Staff Only</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-amber-600/20 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-500 shadow-inner">
              <ShieldAlert className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Shop<span className="text-amber-500">Ease</span> Admin Portal
            </h1>
            <p className="text-gray-400 text-xs mt-1.5 font-medium">
              Enterprise Store Fulfillment & Analytics Workspace
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs font-medium leading-relaxed flex items-start gap-2.5">
              <span className="text-red-400 font-black text-sm select-none">✕</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2"
              >
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@shopease.com"
                  autoComplete="email"
                  required
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-950/40 hover:shadow-amber-900/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                <span>Access Admin Control Room</span>
              )}
            </button>
          </form>

          {/* Footer: Preview customer storefront in new tab */}
          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <a
              href={getStorefrontUrl("/")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 font-medium transition-colors group"
            >
              <span>Visit Customer Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition-colors" />
            </a>
          </div>
        </div>

        {/* Security watermark */}
        <p className="mt-6 text-center text-[11px] text-gray-600 font-medium">
          ShopEase Security Infrastructure • IP & Session Audited
        </p>
      </div>
    </div>
  );
}

