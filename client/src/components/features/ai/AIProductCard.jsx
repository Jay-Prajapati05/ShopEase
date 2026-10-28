import { Link } from "react-router-dom";
import { Star, ExternalLink, Package } from "lucide-react";

/**
 * AIProductCard.jsx
 *
 * Clickable mini-card rendered within AI assistant messages for recommended items.
 * Strictly displays trusted properties from backend database records (Security Requirement 8):
 *   - _id, name, price, rating, category, image
 */
export default function AIProductCard({ product, onSelect }) {
  if (!product || !product._id) return null;

  return (
    <Link
      to={`/products/${product._id}`}
      onClick={onSelect}
      className="group flex items-center gap-3 p-2.5 bg-white hover:bg-brand-50/50 rounded-xl border border-gray-200 hover:border-brand-300 shadow-xs hover:shadow-md transition-all duration-200 text-left w-full"
    >
      {/* Product Image Thumbnail */}
      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative border border-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Package className="w-6 h-6 stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-gray-900 group-hover:text-brand-700 transition-colors truncate">
          {product.name}
        </h4>

        {product.category && (
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium truncate mt-0.5">
            {product.category}
          </p>
        )}

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs font-bold text-gray-950">
            ₹{product.price?.toLocaleString("en-IN")}
          </span>

          {typeof product.rating === "number" && product.rating > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/60">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Arrow / Action indicator */}
      <div className="text-gray-400 group-hover:text-brand-600 transition-colors pl-1">
        <ExternalLink className="w-3.5 h-3.5 stroke-[2]" />
      </div>
    </Link>
  );
}
