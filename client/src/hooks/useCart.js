import { useContext } from "react";
import { CartContext } from "../context/CartContext.jsx";

/**
 * Custom hook to consume CartContext.
 *
 * Usage:
 *   const { cartItems, totalItems, addItem, removeItem } = useCart();
 *
 * Throws if used outside of <CartProvider>.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
}
