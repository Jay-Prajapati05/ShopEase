import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";
import { isAdminSubdomain } from "../utils/subdomain.js";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ProductsPage from "../pages/ProductsPage.jsx";
import ProductDetailPage from "../pages/ProductDetailPage.jsx";
import CartPage from "../pages/CartPage.jsx";
import CheckoutPage from "../pages/CheckoutPage.jsx";
import OrderSuccessPage from "../pages/OrderSuccessPage.jsx";
import MyOrdersPage from "../pages/MyOrdersPage.jsx";
import OrderDetailPage from "../pages/OrderDetailPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";

// Admin components are lazy-loaded so they are excluded from the customer
// bundle. The browser only downloads them when an admin actually navigates
// to an /admin route.
const AdminLayout = lazy(() =>
  import("../components/admin/AdminLayout.jsx")
);
const AdminDashboardPage = lazy(() =>
  import("../pages/admin/AdminDashboardPage.jsx")
);
const AdminProductsPage = lazy(() =>
  import("../pages/admin/AdminProductsPage.jsx")
);
const AdminOrdersPage = lazy(() =>
  import("../pages/admin/AdminOrdersPage.jsx")
);
const AdminUsersPage = lazy(() =>
  import("../pages/admin/AdminUsersPage.jsx")
);
const AdminLoginPage = lazy(() =>
  import("../pages/admin/AdminLoginPage.jsx")
);

/** Minimal loading fallback shown while an admin chunk is being fetched. */
function AdminLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading admin panel…</p>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  const isSubdomain = isAdminSubdomain();

  // ---------------------------------------------------------------------------
  // Dedicated Admin Subdomain (e.g. admin.localhost:8000 or admin.shopease.com)
  // Root URL '/' maps directly to the Admin Dashboard!
  // ---------------------------------------------------------------------------
  if (isSubdomain) {
    return (
      <Routes>
        <Route element={<AdminRoute />}>
          <Route
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminLayout />
              </Suspense>
            }
          >
            {/* Both root '/' and '/admin' render the Admin Dashboard */}
            <Route
              index
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminDashboardPage />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminDashboardPage />
                </Suspense>
              }
            />

            {/* Products management */}
            <Route
              path="/products"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminProductsPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/products"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminProductsPage />
                </Suspense>
              }
            />

            {/* Orders management */}
            <Route
              path="/orders"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminOrdersPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminOrdersPage />
                </Suspense>
              }
            />

            {/* Users management */}
            <Route
              path="/users"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminUsersPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/users"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminUsersPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* Dedicated Admin Portal Login on admin subdomain */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminLoginPage />
            </Suspense>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 404 on admin subdomain */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  // ---------------------------------------------------------------------------
  // Customer Storefront (e.g. localhost:8000 or shopease.com)
  // Standard consumer shopping layout with fallback admin route support
  // ---------------------------------------------------------------------------
  return (
    <Routes>
      {/* Fallback admin routes on main domain (lazy-loaded) */}
      <Route element={<AdminRoute />}>
        <Route
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route
            path="/admin"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/products"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminProductsPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminOrdersPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/users"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminUsersPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/* Customer storefront routes — wrapped in Navbar + Footer layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected customer routes (logged-in users only) */}
        <Route element={<PrivateRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/success/:id" element={<OrderSuccessPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 404 — must stay last */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
