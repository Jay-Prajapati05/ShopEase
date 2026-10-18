import { useState } from "react";

/**
 * Rating Component
 * Works in two modes:
 * 1. Read-only: Displays stars with optional numeric score and review count.
 * 2. Interactive: Allows user to hover and select 1 to 5 stars.
 *
 * @param {number} value - Current rating (0 to 5)
 * @param {string} text - Optional label (e.g. "12 reviews")
 * @param {boolean} interactive - Whether stars can be hovered/clicked
 * @param {function} onChange - Callback when a star is selected (1-5)
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function Rating({
  value = 0,
  text = "",
  interactive = false,
  onChange = () => {},
  size = "md",
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const starSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const currentVal = interactive ? (hoverValue || value) : value;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = currentVal >= star;
          const isHalf = !isFilled && currentVal >= star - 0.5 && !interactive;

          return (
            <button
              key={star}
              type={interactive ? "button" : undefined}
              disabled={!interactive}
              onClick={() => interactive && onChange(star)}
              onMouseEnter={() => interactive && setHoverValue(star)}
              onMouseLeave={() => interactive && setHoverValue(0)}
              className={`transition-colors ${
                interactive
                  ? "cursor-pointer hover:scale-110 active:scale-95 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  : "cursor-default pointer-events-none"
              }`}
              aria-label={`${star} star`}
            >
              <svg
                className={`${starSizes[size]} ${
                  isFilled
                    ? "text-amber-500 fill-amber-500"
                    : isHalf
                    ? "text-amber-500 fill-amber-500/50"
                    : "text-slate-300 fill-slate-100"
                } transition-colors`}
                viewBox="0 0 20 20"
                stroke="currentColor"
                strokeWidth={isFilled || isHalf ? "0" : "1.5"}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>

      {text && (
        <span className="text-sm font-medium text-slate-600 ml-1">
          {text}
        </span>
      )}
    </div>
  );
}
