/**
 * ProductCardSkeleton
 *
 * Shimmer placeholder shown while products are loading.
 * Matches the exact layout of ProductCard so there is no layout shift.
 *
 * Usage:
 *   {loading && Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
 */
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-gray-200" />

      {/* Info placeholder */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2.5">
        {/* Category badge */}
        <div className="h-4 w-16 bg-gray-200 rounded-md" />

        {/* Name — two lines */}
        <div className="space-y-1.5">
          <div className="h-3.5 bg-gray-200 rounded w-full" />
          <div className="h-3.5 bg-gray-200 rounded w-3/4" />
        </div>

        {/* Brand */}
        <div className="h-3 bg-gray-100 rounded w-1/3" />

        {/* Rating */}
        <div className="h-3.5 bg-gray-100 rounded w-1/4" />

        {/* Price + button row */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="space-y-1">
            <div className="h-5 bg-gray-200 rounded w-20" />
            <div className="h-3 bg-gray-100 rounded w-14" />
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

