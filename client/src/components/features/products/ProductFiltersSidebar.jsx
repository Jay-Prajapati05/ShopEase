import { useState } from "react";
import { Star, RotateCcw, SlidersHorizontal, Check } from "lucide-react";

/**
 * ProductFiltersSidebar
 *
 * Sticky desktop sidebar and mobile drawer filter controls.
 * Uses realistic e-commerce price tiers and category filters.
 */
const PRICE_PRESETS = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under ₹5,000", min: "", max: "5000" },
  { label: "₹5,000 – ₹20,000", min: "5000", max: "20000" },
  { label: "₹20,000 – ₹70,000", min: "20000", max: "70000" },
  { label: "Over ₹70,000", min: "70000", max: "" },
];

const RATING_OPTIONS = [
  { label: "4★ & above", value: "4" },
  { label: "3★ & above", value: "3" },
  { label: "2★ & above", value: "2" },
];

export default function ProductFiltersSidebar({
  categories = [],
  filters = {},
  onFilterChange = () => {},
  onReset = () => {},
  activeCount = 0,
  isMobile = false,
  onCloseMobile,
}) {
  const [customMin, setCustomMin] = useState(filters.minPrice || "");
  const [customMax, setCustomMax] = useState(filters.maxPrice || "");

  const handleApplyCustomPrice = (e) => {
    e.preventDefault();
    onFilterChange({
      minPrice: customMin || "",
      maxPrice: customMax || "",
    });
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const handlePricePreset = (preset) => {
    setCustomMin(preset.min);
    setCustomMax(preset.max);
    onFilterChange({
      minPrice: preset.min,
      maxPrice: preset.max,
    });
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const isPresetActive = (preset) => {
    return (
      (filters.minPrice || "") === preset.min &&
      (filters.maxPrice || "") === preset.max
    );
  };

  return (
    <aside
      className={`flex flex-col gap-6 text-gray-800 ${
        isMobile
          ? "w-full p-4"
          : "w-64 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-black text-gray-900 tracking-tight">
            Filters {activeCount > 0 && `(${activeCount})`}
          </h3>
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
          Category
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              onFilterChange({ category: "" });
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg transition text-left cursor-pointer ${
              !filters.category
                ? "bg-brand-50 text-brand-800 font-bold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span>All Categories</span>
            {!filters.category && <Check className="w-3.5 h-3.5 text-brand-700" />}
          </button>

          {categories.map((cat) => {
            const isSelected =
              filters.category &&
              filters.category.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onFilterChange({ category: isSelected ? "" : cat });
                  if (isMobile && onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg transition text-left capitalize cursor-pointer ${
                  isSelected
                    ? "bg-brand-50 text-brand-800 font-bold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{cat}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-700" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range Filter */}
      <div className="space-y-2.5 border-t border-gray-100 pt-4">
        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
          Price Range
        </h4>

        {/* Quick Presets */}
        <div className="flex flex-col gap-1">
          {PRICE_PRESETS.map((preset) => {
            const active = isPresetActive(preset);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePricePreset(preset)}
                className={`w-full flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg transition text-left cursor-pointer ${
                  active
                    ? "bg-brand-50 text-brand-800 font-bold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{preset.label}</span>
                {active && <Check className="w-3.5 h-3.5 text-brand-700" />}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max Inputs */}
        <form onSubmit={handleApplyCustomPrice} className="pt-2 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                ₹
              </span>
              <input
                type="number"
                min="0"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                placeholder="Min"
                className="w-full pl-6 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500"
              />
            </div>
            <span className="text-gray-300 text-xs">–</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                ₹
              </span>
              <input
                type="number"
                min="0"
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                placeholder="Max"
                className="w-full pl-6 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-brand-600 transition shadow-2xs cursor-pointer"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* 3. Customer Rating Filter */}
      <div className="space-y-2.5 border-t border-gray-100 pt-4">
        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
          Customer Rating
        </h4>
        <div className="space-y-1">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = filters.minRating === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onFilterChange({ minRating: isSelected ? "" : opt.value });
                  if (isMobile && onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg transition text-left cursor-pointer ${
                  isSelected
                    ? "bg-brand-50 text-brand-800 font-bold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Number(opt.value)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span>& Up</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-700" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Availability Toggle */}
      <div className="border-t border-gray-100 pt-4">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-xs font-bold text-gray-700">In Stock Only</span>
          <input
            type="checkbox"
            checked={Boolean(filters.inStock)}
            onChange={(e) => {
              onFilterChange({ inStock: e.target.checked });
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-500 cursor-pointer"
          />
        </label>
      </div>
    </aside>
  );
}
