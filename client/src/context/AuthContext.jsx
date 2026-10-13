import { createContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/auth.api.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // loading: true while app checks for an existing session on mount
  const [loading, setLoading] = useState(true);

  // On app startup, try to restore the session by calling /auth/me.
  // The Axios interceptor in axios.js will automatically attempt a
  // token refresh if /auth/me returns 401, so we do not need to
  // handle that case manually here.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const data = await authApi.getMe();
        if (!cancelled) {
          setUser(data.data.user);
        }
      } catch {
        // Session could not be restored (not logged in or refresh failed).
        // This is normal — not an error we need to report.
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    // Cleanup: if the component unmounts before the async call finishes
    // (e.g. during Hot Module Replacement in dev), do not set state.
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.data.user);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await authApi.register(userData);
    setUser(data.data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Always clear local user state, even if the server call fails,
      // so the UI never shows a phantom logged-in state.
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
