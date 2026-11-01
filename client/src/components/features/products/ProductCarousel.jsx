import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import ProductCardSkeleton from "./ProductCardSkeleton.jsx";

/**
 * ProductCarousel
 *
 * Amazon / Flipkart style 4-5 product sliding window carousel.
 * Features:
 * - 4-5 items visible on desktop / wide screens, 2-3 on tablet/mobile.
 * - Smooth horizontal scroll with touch swipe and hardware-accelerated inertia.
 * - Left/Right navigation buttons with boundary detection (auto disable at start/end).
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollBounds = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScrollBounds();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollBounds, { passive: true });
    window.addEventListener("resize", checkScrollBounds);

    return () => {
      el.removeEventListener("scroll", checkScrollBounds);
      window.removeEventListener("resize", checkScrollBounds);
    };
  }, [products, loading]);

  const handleScroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollDistance = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollDistance : scrollDistance,
      behavior: "smooth",
    });
  };

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

        {/* Controls: Navigation Arrows + View All */}
        <div className="flex items-center gap-2 sm:gap-3">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 hover:underline mr-1 sm:mr-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Slide previous products"
              className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                canScrollLeft
                  ? "bg-white border-gray-200 text-gray-800 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-900 shadow-2xs active:scale-95 cursor-pointer"
                  : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.25]" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Slide next products"
              className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                canScrollRight
                  ? "bg-white border-gray-200 text-gray-800 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-900 shadow-2xs active:scale-95 cursor-pointer"
                  : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50"
              }`}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.25]" />
            </button>
          </div>
        </div>
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

