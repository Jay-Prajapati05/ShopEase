import { Link } from "react-router-dom";
import { ShoppingCart, Check, Star, Package } from "lucide-react";
import { useCart } from "../../../hooks/useCart.js";

/**
 * Displays a single product in the products grid.
 * "Add to Cart" is handled here so the card is self-contained.
 */
export default function ProductCard({ product }) {
  const { addItem, isInCart, getItemQty } = useCart();
  const inCart = isInCart(product._id);
  const cartQty = getItemQty(product._id);
  const outOfStock = product.countInStock === 0;
  const atMax = cartQty >= product.countInStock;

  const handleAddToCart = (e) => {
    // Prevent the card's Link from triggering navigation
    e.preventDefault();
    if (!outOfStock && !atMax) {
      addItem(product, 1);
    }
  };

  const imageUrl = product.images?.[0]?.url;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-lg hover:border-brand-200 hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-100 text-gray-400 gap-1.5 p-4 text-center">
            <Package className="w-10 h-10 stroke-[1.25] text-gray-300 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-400">
              ShopEase
            </span>
          </div>
        )}

        {/* Stock badge */}
        {outOfStock && (
          <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
            Out of Stock
          </div>
        )}
        {!outOfStock && product.countInStock <= 5 && (
          <div className="absolute top-2.5 left-2.5 bg-brand-500 text-gray-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
            Only {product.countInStock} left
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-1.5 sm:gap-2">
        {/* Category badge */}
        <span className="text-[10px] sm:text-[11px] font-bold text-brand-800 bg-brand-50 border border-brand-200/80 px-2 py-0.5 rounded-md w-fit capitalize tracking-wide">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>

        {/* Brand */}
        {product.brand && (
          <p className="text-[11px] sm:text-xs text-gray-400 font-medium truncate">{product.brand}</p>
        )}

        {/* Price + Cart button */}
        <div className="flex items-center justify-between gap-1.5 mt-auto pt-2.5 sm:pt-3 border-t border-gray-50">
          <div className="min-w-0">
            <span className="text-sm sm:text-base md:text-lg font-black text-gray-900 tracking-tight block truncate">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={outOfStock || atMax}
            className={`flex-shrink-0 flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all shadow-xs
              ${
                inCart && !atMax
                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  : outOfStock || atMax
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "bg-brand-500 text-gray-950 hover:bg-brand-600 hover:text-white"
              }`}
            aria-label={inCart ? "In cart" : "Add to cart"}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">{atMax ? "Max" : `In Cart (${cartQty})`}</span>
                <span className="sm:hidden">{cartQty}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

