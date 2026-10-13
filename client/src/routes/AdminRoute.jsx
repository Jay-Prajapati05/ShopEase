import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

/**
 * Protects routes that require the admin role.
 * A logged-in non-admin user is sent to the home page (not login).
 */
export default function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
