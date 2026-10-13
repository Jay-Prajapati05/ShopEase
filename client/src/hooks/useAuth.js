import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

/**
 * Custom hook to consume AuthContext.
 *
 * Usage:
 *   const { user, loading, isAuthenticated, isAdmin, login, logout } = useAuth();
 *
 * Throws if used outside of <AuthProvider> so bugs are caught early.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
