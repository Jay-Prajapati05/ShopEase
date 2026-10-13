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
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col"
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
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Stock badge */}
        {outOfStock && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Out of Stock
          </div>
        )}
        {!outOfStock && product.countInStock <= 5 && (
          <div className="absolute top-2 left-2 bg-amber-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Only {product.countInStock} left
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Category */}
        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full w-fit capitalize">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-400">{product.brand}</p>
        )}

        {/* Price + Cart button */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={outOfStock || atMax}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors
              ${
                inCart && !atMax
                  ? "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
                  : outOfStock || atMax
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-brand-600 text-white hover:bg-brand-700"
              }`}
            aria-label={inCart ? "In cart" : "Add to cart"}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                {atMax ? "Max" : `In Cart (${cartQty})`}
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
