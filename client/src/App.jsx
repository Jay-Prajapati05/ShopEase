import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

/**
 * Root component.
 * Layer order matters:
 *   BrowserRouter  — provides routing context
 *     AuthProvider — provides user/session context (needs router for <Navigate>)
 *       AppRoutes  — renders the matched page
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
