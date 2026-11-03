import { useState } from "react";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ProductImageGallery
 *
 * Commercial e-commerce product image gallery inspired by Flipkart & Amazon:
 * - Well-proportioned responsive sizing across mobile, laptop, and desktop
 * - Clean white background canvas with object-contain display
 * - Interactive pagination dots below the main image (indicates active image & count)
 * - Mobile touch swipe gestures
 * - Desktop hover zoom & vertical thumbnail rail
 * - Mobile compact thumbnail strip below pagination dots
 */
export default function ProductImageGallery({
  images = [],
  productName = "Product",
  isOutOfStock = false,
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const validImages = Array.isArray(images) && images.length > 0 ? images : [];
  const currentImage = validImages[selectedIdx]?.url;

  const handlePrev = () => {
    setSelectedIdx((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev + 1) % validImages.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;
    if (deltaX > 40) {
      handleNext();
    } else if (deltaX < -40) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-start w-full">
      {/* 1. Desktop Thumbnail Rail (Vertical on sm screens and above) */}
      {validImages.length > 1 && (
        <div className="hidden sm:flex sm:flex-col gap-2 overflow-y-auto max-h-[460px] no-scrollbar py-1 w-16 flex-shrink-0">
          {validImages.map((img, idx) => (
            <button
              key={img.public_id || idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              aria-label={`Select product image ${idx + 1}`}
              className={`relative aspect-square w-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer bg-white p-1 ${
                selectedIdx === idx
                  ? "border-brand-500 ring-2 ring-brand-300 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* 2. Main Image Viewer & Dots */}
      <div className="flex-1 w-full flex flex-col items-center">
        <div
          className="relative w-full aspect-[4/3] sm:aspect-square max-h-[460px] bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 overflow-hidden flex items-center justify-center shadow-xs group select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentImage ? (
            <div
              className="w-full h-full overflow-hidden flex items-center justify-center p-2 sm:p-3 cursor-crosshair"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={currentImage}
                alt={`${productName} preview`}
                className={`w-full h-full object-contain transition-transform duration-300 ${
                  isZoomed ? "scale-115" : "scale-100"
                }`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-2 p-6 text-center">
              <Package className="w-12 h-12 stroke-[1.25] text-gray-300" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                No Image Available
              </span>
            </div>
          )}

          {/* Out of Stock Overlay Pill */}
          {isOutOfStock && (
            <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider shadow-sm">
              Out of Stock
            </span>
          )}

          {/* Image Index Badge */}
          {validImages.length > 1 && (
            <span className="absolute bottom-3 right-3 z-10 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
              {selectedIdx + 1} / {validImages.length}
            </span>
          )}

          {/* Left & Right Preview Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-200/60 opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-200/60 opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>
            </>
          )}
        </div>

        {/* 3. Pagination Dots Indicator */}
        {validImages.length > 1 && (
          <div
            className="flex items-center justify-center gap-1.5 pt-3"
            role="tablist"
            aria-label="Product image pagination"
          >
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={selectedIdx === idx}
                onClick={() => setSelectedIdx(idx)}
                aria-label={`Go to image ${idx + 1} of ${validImages.length}`}
                className={`h-2 transition-all duration-200 cursor-pointer rounded-full ${
                  selectedIdx === idx
                    ? "w-6 bg-brand-500 shadow-xs"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}

        {/* 4. Mobile Thumbnails (Horizontal strip below dots on small screens) */}
        {validImages.length > 1 && (
          <div className="flex sm:hidden gap-2 overflow-x-auto no-scrollbar py-2 w-full justify-center">
            {validImages.map((img, idx) => (
              <button
                key={img.public_id || idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                aria-label={`Select product image ${idx + 1}`}
                className={`relative aspect-square w-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer bg-white p-1 ${
                  selectedIdx === idx
                    ? "border-brand-500 ring-2 ring-brand-300 shadow-xs"
                    : "border-gray-200 opacity-70"
                }`}
              >
                <img
                  src={img.url}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
