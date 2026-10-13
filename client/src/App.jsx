import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

/**
 * Root component.
 * Layer order matters:
 *   BrowserRouter  — provides routing context
 *     AuthProvider — provides user/session context
 *       CartProvider — provides cart state (needs auth for future DB-cart)
 *         AppRoutes  — renders the matched page
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

