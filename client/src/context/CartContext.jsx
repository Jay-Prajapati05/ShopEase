import { createContext, useReducer, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth.js";

export const CartContext = createContext(null);

const CART_STORAGE_PREFIX = "shopease_cart_";

// --- Helpers ---

function getStorageKey(userId) {
  return userId ? `${CART_STORAGE_PREFIX}${userId}` : `${CART_STORAGE_PREFIX}guest`;
}

function loadFromStorage(userId) {
  try {
    // Clean up legacy shared cart key if it still exists
    if (localStorage.getItem("shopease_cart")) {
      localStorage.removeItem("shopease_cart");
    }
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(userId, cart) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(cart));
  } catch {
    // Storage quota exceeded or private browsing — fail silently
  }
}

// --- Reducer ---

/**
 * Cart item shape stored in state:
 * { productId, name, price, image, countInStock, qty }
 *
 * We store price and image for display only.
 * The server ALWAYS recalculates the real total at order time.
 */
function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return Array.isArray(action.payload) ? action.payload : [];

    case "ADD_ITEM": {
      const { product, qty = 1 } = action.payload;
      const existing = state.find((i) => i.productId === product._id);

      if (existing) {
        // Increment qty, but never exceed countInStock
        return state.map((i) =>
          i.productId === product._id
            ? {
                ...i,
                qty: Math.min(i.qty + qty, product.countInStock),
              }
            : i
        );
      }

      // New item — cap at countInStock just in case
      return [
        ...state,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || "",
          countInStock: product.countInStock,
          qty: Math.min(qty, product.countInStock),
        },
      ];
    }

    case "REMOVE_ITEM":
      return state.filter((i) => i.productId !== action.payload.productId);

    case "UPDATE_QTY": {
      const { productId, qty } = action.payload;
      if (qty <= 0) {
        return state.filter((i) => i.productId !== productId);
      }
      return state.map((i) =>
        i.productId === productId
          ? { ...i, qty: Math.min(qty, i.countInStock) }
          : i
      );
    }

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
}

// --- Provider ---

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || user?._id || null;
  const prevUserIdRef = useRef(userId);

  const [cartItems, dispatch] = useReducer(
    cartReducer,
    [],
    () => loadFromStorage(userId)
  );

  // Synchronize cart whenever user authentication changes (login, logout, switch user)
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    // Case 1: Guest logs in -> Merge any guest items into the user's cart
    if (!prevUserId && userId) {
      const guestItems = loadFromStorage(null);
      const userItems = loadFromStorage(userId);

      if (guestItems.length > 0) {
        const merged = [...userItems];
        for (const guestItem of guestItems) {
          const existing = merged.find((i) => i.productId === guestItem.productId);
          if (existing) {
            existing.qty = Math.min(
              existing.qty + guestItem.qty,
              existing.countInStock || guestItem.countInStock
            );
          } else {
            merged.push(guestItem);
          }
        }
        // Save merged cart for user and empty the guest cart
        saveToStorage(userId, merged);
        localStorage.removeItem(getStorageKey(null));
        dispatch({ type: "SET_CART", payload: merged });
        return;
      }

      // Guest cart was empty, load user's cart directly
      dispatch({ type: "SET_CART", payload: userItems });
      return;
    }

    // Case 2: User logs out -> Switch to clean guest cart (resets badge to 0)
    if (prevUserId && !userId) {
      const guestItems = loadFromStorage(null);
      dispatch({ type: "SET_CART", payload: guestItems });
      return;
    }

    // Case 3: Different user logs in (switch accounts)
    if (prevUserId !== userId) {
      const userItems = loadFromStorage(userId);
      dispatch({ type: "SET_CART", payload: userItems });
    }
  }, [userId]);

  // Persist to the active user's storage key whenever cart changes
  useEffect(() => {
    saveToStorage(userId, cartItems);
  }, [cartItems, userId]);

  // Derived values (display only — server recalculates at order time)
  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const addItem = (product, qty = 1) =>
    dispatch({ type: "ADD_ITEM", payload: { product, qty } });

  const removeItem = (productId) =>
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });

  const updateQty = (productId, qty) =>
    dispatch({ type: "UPDATE_QTY", payload: { productId, qty } });

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const isInCart = (productId) => cartItems.some((i) => i.productId === productId);

  const getItemQty = (productId) =>
    cartItems.find((i) => i.productId === productId)?.qty || 0;

  const value = {
    cartItems,
    totalItems,
    subtotal,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    isInCart,
    getItemQty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

