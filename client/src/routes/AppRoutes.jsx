import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";

// Future phase imports (add as features are built):
// import ProductsPage from "../pages/ProductsPage.jsx";
// import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes — wrapped in the shared Navbar + Footer layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes (logged-in users only) */}
        <Route element={<PrivateRoute />}>
          {/* Phase 5+ routes go here, e.g. /products, /cart, /orders */}
        </Route>

        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          {/* Phase 7+ admin routes go here */}
        </Route>

        {/* 404 — must stay last */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
