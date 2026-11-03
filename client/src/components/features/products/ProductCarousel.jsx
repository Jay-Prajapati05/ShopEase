import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import ProductCardSkeleton from "./ProductCardSkeleton.jsx";

/**
 * ProductCarousel
 *
 * Amazon / Flipkart style 4-5 product sliding window carousel.
 * Features:
 * - 4-5 items visible on desktop / wide screens, 2-3 on tablet/mobile.
 * - Smooth horizontal scroll with touch swipe and trackpad scroll.
 * - Direct "View All" catalog link.
 * - Shimmer skeleton state matching exact card geometry.
 */
export default function ProductCarousel({
  title = "Featured Products",
  subtitle,
  badge = "Popular",
  badgeIcon: BadgeIcon = Sparkles,
  products = [],
  loading = false,
  viewAllLink = "/products",
}) {
  const scrollRef = useRef(null);

  if (!loading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="w-full py-6 sm:py-8">
      {/* Header Row */}
      <div className="flex items-end justify-between mb-4 sm:mb-6">
        <div>
          {badge && (
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200/80 w-fit mb-1.5 shadow-2xs">
              {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-brand-600 fill-brand-400" />}
              <span>{badge}</span>
            </div>
          )}
          <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* View All Action */}
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 hover:underline flex-shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* 4-5 Sliding Window Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-2 pt-1 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-none w-[165px] xs:w-[190px] sm:w-[220px] md:w-[240px] lg:w-[calc(25%-15px)] xl:w-[calc(20%-16px)] snap-start"
              >
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((product) => (
              <div
                key={product._id}
                className="flex-none w-[165px] xs:w-[190px] sm:w-[220px] md:w-[240px] lg:w-[calc(25%-15px)] xl:w-[calc(20%-16px)] snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
}
