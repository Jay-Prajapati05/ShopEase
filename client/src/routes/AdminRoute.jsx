import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { isAdminSubdomain, getStorefrontUrl } from "../utils/subdomain.js";

/**
 * Protects routes that require the admin role.
 * A logged-in non-admin user is sent to the customer storefront.
 */
export default function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return null;

  const loginPath = isAdminSubdomain() ? "/login" : "/admin/login";

  if (!isAuthenticated) return <Navigate to={loginPath} replace />;

  if (!isAdmin) {
    if (isAdminSubdomain()) {
      // Non-admin logged-in user on admin subdomain -> redirect to storefront
      window.location.href = getStorefrontUrl("/");
      return null;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
