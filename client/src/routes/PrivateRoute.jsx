import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

/**
 * Protects routes that require a logged-in user.
 * While session is restoring (loading = true), renders nothing
 * so we avoid a flash of the login redirect.
 */
export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    // Save the page the user was trying to visit so we can
    // redirect them back after a successful login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
