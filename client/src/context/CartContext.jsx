import { createContext, useReducer, useEffect } from "react";

export const CartContext = createContext(null);

const CART_STORAGE_KEY = "shopease_cart";

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

// --- Helpers ---

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage quota exceeded or private browsing — fail silently
  }
}

// --- Provider ---

export function CartProvider({ children }) {
  const [cartItems, dispatch] = useReducer(cartReducer, [], loadFromStorage);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    saveToStorage(cartItems);
  }, [cartItems]);

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
