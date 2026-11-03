import { Tag, Sparkles } from "lucide-react";

/**
 * ProductPriceBlock
 *
 * Commercial e-commerce price anatomy:
 * - Selling Price (Large, bold)
 * - Original Price / MRP (Strikethrough)
 * - Discount Badge (% OFF in high-contrast green)
 * - Total Savings Breakdown
 * - Bank / Special Promotional Offers
 */
export default function ProductPriceBlock({ price = 0, originalPrice }) {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const savingsAmount = hasDiscount ? originalPrice - price : 0;

  return (
    <div className="space-y-3 pb-6 border-b border-gray-100">
      {/* Special Price Tag */}
      {hasDiscount && (
        <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-md">
          <Tag className="w-3.5 h-3.5" />
          <span>Special Offer Price</span>
        </div>
      )}

      {/* Main Price Row */}
      <div className="flex items-baseline flex-wrap gap-3">
        <span className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
          ₹{price.toLocaleString("en-IN")}
        </span>

        {hasDiscount && (
          <>
            <span className="text-base sm:text-lg text-gray-400 line-through font-medium">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-xs sm:text-sm font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-lg">
              {discountPct}% OFF
            </span>
          </>
        )}
      </div>

      {/* Savings Breakdown */}
      {hasDiscount && (
        <p className="text-xs font-bold text-green-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 fill-green-600 text-green-600" />
          <span>
            You save ₹{savingsAmount.toLocaleString("en-IN")} ({discountPct}%) on this purchase!
          </span>
        </p>
      )}

      <p className="text-[11px] text-gray-400 font-medium">
        Inclusive of all applicable GST & taxes.
      </p>

      {/* Promotional Bank Offers Pill */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-950 flex flex-col gap-1">
        <div className="font-bold flex items-center gap-1.5 text-amber-900">
          <Tag className="w-3.5 h-3.5 text-brand-600" />
          <span>Available Bank Offers</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          • Instant 10% Cashback on RuPay & UPI transactions up to ₹500.
          <br />
          • Flat ₹100 Off on your first ShopEase checkout.
        </p>
      </div>
    </div>
  );
}

