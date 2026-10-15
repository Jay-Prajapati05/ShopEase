import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";
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

import AdminLayout from "../components/admin/AdminLayout.jsx";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import AdminProductsPage from "../pages/admin/AdminProductsPage.jsx";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage.jsx";
import AdminUsersPage from "../pages/admin/AdminUsersPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Admin routes — wrapped in dedicated AdminLayout */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
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
        </Route>

        {/* 404 — must stay last */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
