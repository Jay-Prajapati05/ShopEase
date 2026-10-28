import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import AIChatbot from "../features/ai/AIChatbot.jsx";

/**
 * MainLayout wraps every public and protected page with
 * the shared Navbar at the top and Footer at the bottom.
 * <Outlet /> is where the matched child route renders.
 * <AIChatbot /> mounts the floating AI shopping assistant across the customer storefront.
 */
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden w-full max-w-full">
      <Navbar />
      <main className="flex-1 w-full max-w-full">
        <Outlet />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}
