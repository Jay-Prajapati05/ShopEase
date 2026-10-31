import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, Star, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "../../../hooks/useCart.js";

/**
 * ProductCard
 *
 * Features:
 * - Multi-image slider: desktop hover arrows + mobile swipe.
 * - MRP strikethrough + % OFF badge (when originalPrice > price).
 * - Dot indicators for multiple images.
 * - Out-of-stock / low-stock badges.
 * - Self-contained Add-to-Cart button.
 */
export default function ProductCard({ product }) {
  const { addItem, isInCart, getItemQty } = useCart();
  const inCart = isInCart(product._id);
  const cartQty = getItemQty(product._id);
  const outOfStock = product.countInStock === 0;
  const atMax = cartQty >= product.countInStock;

  // ── Image slider state ─────────────────────────────────────────────────────
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [];
  const hasMultiple = images.length > 1;
  const [activeIdx, setActiveIdx] = useState(0);

  // Touch tracking refs for swipe detection
  const touchStartX = useRef(null);

  const goPrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((i) => (i - 1 + images.length) % images.length);
  };

  const goNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((i) => (i + 1) % images.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      // Swipe threshold: 40px
      if (delta > 0) {
        setActiveIdx((i) => (i + 1) % images.length);
      } else {
        setActiveIdx((i) => (i - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
  };

  // ── Discount badge ─────────────────────────────────────────────────────────
  const originalPrice = product.originalPrice;
  const hasDiscount =
    originalPrice && originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  // ── Cart handler ───────────────────────────────────────────────────────────
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!outOfStock && !atMax) addItem(product, 1);
  };

  const currentImageUrl = images[activeIdx]?.url;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-lg hover:border-brand-200 hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* ── Image area ──────────────────────────────────────────────────── */}
      <div
        className="relative aspect-square bg-gray-50 overflow-hidden"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
      >
        {currentImageUrl ? (
          <img
            key={currentImageUrl}
            src={currentImageUrl}
            alt={`${product.name} — image ${activeIdx + 1}`}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
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

        {/* Discount badge — top right */}
        {hasDiscount && (
          <div className="absolute top-2.5 right-2.5 bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm z-10">
            {discountPct}% OFF
          </div>
        )}

        {/* Stock badges — top left */}
        {outOfStock && (
          <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs z-10">
            Out of Stock
          </div>
        )}
        {!outOfStock && product.countInStock <= 5 && (
          <div className="absolute top-2.5 left-2.5 bg-brand-500 text-gray-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs z-10">
            Only {product.countInStock} left
          </div>
        )}

        {/* Desktop prev/next arrows — visible only when multiple images + hovering */}
        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dot indicators — bottom center */}
        {hasMultiple && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to image ${idx + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveIdx(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  idx === activeIdx
                    ? "bg-white scale-125 shadow"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Product info ─────────────────────────────────────────────────── */}
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
          <p className="text-[11px] sm:text-xs text-gray-400 font-medium truncate">
            {product.brand}
          </p>
        )}

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{(product.rating || 0).toFixed(1)}</span>
            <span className="text-slate-400 font-normal">
              ({product.numReviews})
            </span>
          </div>
        )}

        {/* Price + Cart button */}
        <div className="flex items-center justify-between gap-1.5 mt-auto pt-2.5 sm:pt-3 border-t border-gray-50">
          {/* Price block */}
          <div className="min-w-0">
            <span className="text-sm sm:text-base md:text-lg font-black text-gray-900 tracking-tight block truncate">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-gray-400 line-through leading-none">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={outOfStock || atMax}
            aria-label={inCart ? "In cart" : "Add to cart"}
            className={`flex-shrink-0 flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all shadow-xs
              ${
                inCart && !atMax
                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  : outOfStock || atMax
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "bg-brand-500 text-gray-950 hover:bg-brand-600 hover:text-white"
              }`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">
                  {atMax ? "Max" : `In Cart (${cartQty})`}
                </span>
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
