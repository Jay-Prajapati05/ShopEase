import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Single shared in-flight refresh promise to handle concurrent 401s
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do NOT intercept if:
    // 1. Not a 401 error
    // 2. Already retried once
    // 3. Request was to login (invalid credentials) or refresh itself (expired session)
    const isLoginOrRefresh =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isLoginOrRefresh
    ) {
      originalRequest._retry = true;

      try {
        // If no refresh is in progress, initiate one
        if (!refreshPromise) {
          refreshPromise = api.post("/auth/refresh").finally(() => {
            refreshPromise = null;
          });
        }

        // Wait for the single refresh request to resolve
        await refreshPromise;

        // Retry the original request with newly rotated cookies
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed or expired
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
