import { useState } from "react";
import { Star, RotateCcw, SlidersHorizontal, Check } from "lucide-react";

/**
 * ProductFiltersSidebar
 *
 * Supports two responsive modes:
 * 1. Mobile (isMobile = true): Flipkart/Myntra style 2-Column sheet.
 *    - Left Rail: Vertical tabs (Category, Price, Rating, Availability).
 *    - Right Panel: Filter options for the active tab.
 * 2. Desktop (isMobile = false): Unified sticky vertical sidebar card.
 */
const FILTER_TABS = [
  { id: "category", label: "Category" },
  { id: "price", label: "Price" },
  { id: "rating", label: "Rating" },
  { id: "availability", label: "Availability" },
];

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
  const [activeTab, setActiveTab] = useState("category");
  const [customMin, setCustomMin] = useState(filters.minPrice || "");
  const [customMax, setCustomMax] = useState(filters.maxPrice || "");

  const handleApplyCustomPrice = (e) => {
    e.preventDefault();
    onFilterChange({
      minPrice: customMin || "",
      maxPrice: customMax || "",
    });
  };

  const handlePricePreset = (preset) => {
    setCustomMin(preset.min);
    setCustomMax(preset.max);
    onFilterChange({
      minPrice: preset.min,
      maxPrice: preset.max,
    });
  };

  const isPresetActive = (preset) => {
    return (
      (filters.minPrice || "") === preset.min &&
      (filters.maxPrice || "") === preset.max
    );
  };

  // ---------------------------------------------------------------------------
  // 1. MOBILE MODE: Flipkart-style 2-Column Tabs & Options Layout
  // ---------------------------------------------------------------------------
  if (isMobile) {
    return (
      <div className="flex-1 flex overflow-hidden h-full text-gray-800">
        {/* Left Column: Vertical Category / Section Tabs */}
        <div className="w-28 sm:w-36 bg-gray-50 border-r border-gray-200/80 flex flex-col overflow-y-auto shrink-0 select-none no-scrollbar">
          {FILTER_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            const hasActiveFilter =
              (tab.id === "category" && Boolean(filters.category)) ||
              (tab.id === "price" && Boolean(filters.minPrice || filters.maxPrice)) ||
              (tab.id === "rating" && Boolean(filters.minRating)) ||
              (tab.id === "availability" && Boolean(filters.inStock));

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-3.5 text-left text-xs font-semibold flex items-center justify-between border-b border-gray-100 transition cursor-pointer relative ${
                  isSelected
                    ? "bg-white text-gray-950 font-black border-l-4 border-l-brand-500 shadow-2xs"
                    : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-900"
                }`}
              >
                <span className="truncate">{tab.label}</span>
                {hasActiveFilter && (
                  <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column: Tab Options Content */}
        <div className="flex-1 bg-white p-4 overflow-y-auto no-scrollbar">
          {/* Tab 1: Category */}
          {activeTab === "category" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-900">Categories</span>
                {filters.category && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ category: "" })}
                    className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onFilterChange({ category: "" })}
                  className={`w-full flex items-center justify-between text-xs py-2.5 px-3 rounded-xl transition text-left cursor-pointer ${
                    !filters.category
                      ? "bg-brand-50 text-brand-900 font-bold border border-brand-200/80 shadow-2xs"
                      : "text-gray-700 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <span>All Categories</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      !filters.category
                        ? "border-brand-600 bg-brand-500 text-gray-950"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {!filters.category && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>

                {categories.map((cat) => {
                  const isSelected =
                    filters.category &&
                    filters.category.toLowerCase() === cat.toLowerCase();

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onFilterChange({ category: isSelected ? "" : cat })}
                      className={`w-full flex items-center justify-between text-xs py-2.5 px-3 rounded-xl transition text-left capitalize cursor-pointer ${
                        isSelected
                          ? "bg-brand-50 text-brand-900 font-bold border border-brand-200/80 shadow-2xs"
                          : "text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <span>{cat}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-brand-600 bg-brand-500 text-gray-950"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Price Range */}
          {activeTab === "price" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-900">Price Presets</span>
                {(filters.minPrice || filters.maxPrice) && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ minPrice: "", maxPrice: "" })}
                    className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {PRICE_PRESETS.map((preset) => {
                  const active = isPresetActive(preset);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePricePreset(preset)}
                      className={`w-full flex items-center justify-between text-xs py-2.5 px-3 rounded-xl border transition text-left cursor-pointer select-none ${
                        active
                          ? "bg-brand-50 border-brand-300 text-brand-950 font-bold shadow-2xs"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{preset.label}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          active
                            ? "border-brand-600 bg-brand-500 text-gray-950"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Min / Max Price Inputs */}
              <form onSubmit={handleApplyCustomPrice} className="pt-2 border-t border-gray-100 space-y-2.5">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Custom Range:
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={customMin}
                      onChange={(e) => setCustomMin(e.target.value)}
                      placeholder="Min"
                      className="w-full pl-6 pr-2 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                    />
                  </div>
                  <span className="text-gray-400 text-xs font-bold">–</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={customMax}
                      onChange={(e) => setCustomMax(e.target.value)}
                      placeholder="Max"
                      className="w-full pl-6 pr-2 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-bold bg-gray-900 hover:bg-black text-white rounded-xl transition shadow-2xs cursor-pointer active:scale-98"
                >
                  Apply Custom Price
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: Customer Rating */}
          {activeTab === "rating" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-900">Customer Rating</span>
                {filters.minRating && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ minRating: "" })}
                    className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {RATING_OPTIONS.map((opt) => {
                  const isSelected = filters.minRating === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onFilterChange({ minRating: isSelected ? "" : opt.value })}
                      className={`w-full flex items-center justify-between text-xs py-2.5 px-3 rounded-xl border transition text-left cursor-pointer ${
                        isSelected
                          ? "bg-brand-50 text-brand-900 border-brand-300 font-bold shadow-2xs"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
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
                        <span className="text-xs font-medium">{opt.label}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-brand-600 bg-brand-500 text-gray-950"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: Availability */}
          {activeTab === "availability" && (
            <div className="space-y-3">
              <div className="border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-900">Stock Status</span>
              </div>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition cursor-pointer select-none border border-gray-200/80">
                <div>
                  <div className="text-xs font-bold text-gray-900">In Stock Only</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Exclude out of stock items</div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(filters.inStock)}
                    onChange={(e) => onFilterChange({ inStock: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. DESKTOP MODE: Sticky Vertical Sidebar Card
  // ---------------------------------------------------------------------------
  return (
    <aside className="w-64 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar flex flex-col gap-5 text-gray-800">
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
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
            Category
          </h4>
          {filters.category && (
            <button
              type="button"
              onClick={() => onFilterChange({ category: "" })}
              className="text-[11px] font-bold text-brand-600 hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1 max-h-52 overflow-y-auto pr-1 no-scrollbar">
          <button
            type="button"
            onClick={() => onFilterChange({ category: "" })}
            className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-xl transition text-left cursor-pointer ${
              !filters.category
                ? "bg-brand-50 text-brand-900 font-bold border border-brand-200/80 shadow-2xs"
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
                onClick={() => onFilterChange({ category: isSelected ? "" : cat })}
                className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-xl transition text-left capitalize cursor-pointer ${
                  isSelected
                    ? "bg-brand-50 text-brand-900 font-bold border border-brand-200/80 shadow-2xs"
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
      <div className="space-y-3 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
            Price Range
          </h4>
          {(filters.minPrice || filters.maxPrice) && (
            <button
              type="button"
              onClick={() => onFilterChange({ minPrice: "", maxPrice: "" })}
              className="text-[11px] font-bold text-brand-600 hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Presets (2-column pill grid) */}
        <div className="grid grid-cols-2 gap-1.5">
          {PRICE_PRESETS.map((preset) => {
            const active = isPresetActive(preset);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePricePreset(preset)}
                className={`text-xs py-2 px-2.5 rounded-xl border text-center font-medium transition cursor-pointer select-none ${
                  active
                    ? "bg-brand-500 text-gray-950 font-bold border-brand-500 shadow-2xs"
                    : "bg-gray-50 border-gray-200/70 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max Inputs */}
        <form onSubmit={handleApplyCustomPrice} className="pt-1 space-y-2">
          <div className="text-[11px] font-semibold text-gray-500">Or custom range:</div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                ₹
              </span>
              <input
                type="number"
                min="0"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                placeholder="Min"
                className="w-full pl-6 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>
            <span className="text-gray-300 text-xs font-bold">–</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                ₹
              </span>
              <input
                type="number"
                min="0"
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                placeholder="Max"
                className="w-full pl-6 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 text-xs font-bold bg-gray-900 hover:bg-black text-white rounded-xl transition shadow-2xs cursor-pointer active:scale-98"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* 3. Customer Rating Filter */}
      <div className="space-y-2.5 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
            Customer Rating
          </h4>
          {filters.minRating && (
            <button
              type="button"
              onClick={() => onFilterChange({ minRating: "" })}
              className="text-[11px] font-bold text-brand-600 hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = filters.minRating === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange({ minRating: isSelected ? "" : opt.value })}
                className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-xl border transition text-left cursor-pointer ${
                  isSelected
                    ? "bg-brand-50 text-brand-900 border-brand-200 font-bold shadow-2xs"
                    : "bg-white border-transparent hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
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
                  <span className="text-xs font-medium">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-700" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Availability Toggle */}
      <div className="border-t border-gray-100 pt-4">
        <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition cursor-pointer select-none border border-gray-200/60">
          <div>
            <div className="text-xs font-bold text-gray-900">In Stock Only</div>
            <div className="text-[11px] text-gray-500">Exclude out of stock items</div>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(filters.inStock)}
              onChange={(e) => onFilterChange({ inStock: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
          </div>
        </label>
      </div>
    </aside>
  );
}
