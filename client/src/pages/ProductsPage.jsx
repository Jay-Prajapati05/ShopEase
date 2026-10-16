import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import { productApi } from "../api/product.api.js";
import ProductCard from "../components/features/products/ProductCard.jsx";

// Sort options that match the backend whitelist exactly
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A–Z" },
];

// --- Skeleton card for loading state ---
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 bg-gray-100 rounded-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 w-1/3 bg-gray-100 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-16 bg-gray-100 rounded" />
          <div className="h-7 w-16 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync state from URL so browser back/forward works
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    sort: searchParams.get("sort") || "newest",
    inStock: searchParams.get("inStock") === "true",
    page: Number(searchParams.get("page")) || 1,
  });

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce timer ref
  const debounceRef = useRef(null);

  // --- Fetch categories once ---
  useEffect(() => {
    productApi.getCategories()
      .then((data) => setCategories(data.data.categories))
      .catch(() => {}); // Non-critical; filters still work without it
  }, []);

  // --- Fetch products when filters change ---
  const fetchProducts = useCallback(async (activeFilters) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: activeFilters.page,
        limit: 12,
        sort: activeFilters.sort,
      };
      if (activeFilters.search) params.search = activeFilters.search;
      if (activeFilters.category) params.category = activeFilters.category;
      if (activeFilters.inStock) params.inStock = "true";

      const data = await productApi.getProducts(params);
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch (err) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync filters → URL → fetch
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.sort !== "newest") params.sort = filters.sort;
    if (filters.inStock) params.inStock = "true";
    if (filters.page > 1) params.page = String(filters.page);
    setSearchParams(params, { replace: true });

    fetchProducts(filters);
  }, [filters, fetchProducts, setSearchParams]);

  // --- Handlers ---
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    // Debounce: wait 500ms after the user stops typing
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    }, 500);
  };

  const clearSearch = () => {
    setSearchInput("");
    setFilters((prev) => ({ ...prev, search: "", page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePage = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilters({ search: "", category: "", sort: "newest", inStock: false, page: 1 });
  };

  const activeFilterCount = [
    filters.category,
    filters.inStock,
    filters.sort !== "newest",
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-full">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Products</h1>
        {pagination && !loading && (
          <p className="text-sm text-gray-500">
            {pagination.total} product{pagination.total !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search box */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="product-search"
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search products…"
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange("sort", e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((p) => !p)}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition
            ${showFilters || activeFilterCount > 0
              ? "border-brand-500 text-brand-600 bg-brand-50"
              : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
            }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-6 items-start">
            {/* Category filter */}
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Category
              </label>
              <select
                value={
                  categories.find(
                    (c) =>
                      c.toLowerCase() === (filters.category || "").toLowerCase() ||
                      c.toLowerCase().replace(/e?s$/, "") === (filters.category || "").toLowerCase().replace(/e?s$/, "") ||
                      (c.toLowerCase().includes("eletronic") && (filters.category || "").toLowerCase().includes("electr"))
                  ) || filters.category
                }
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-white capitalize"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
                {filters.category &&
                  !categories.some(
                    (c) =>
                      c.toLowerCase() === filters.category.toLowerCase() ||
                      c.toLowerCase().replace(/e?s$/, "") === filters.category.toLowerCase().replace(/e?s$/, "")
                  ) && (
                    <option value={filters.category} className="capitalize">
                      {filters.category}
                    </option>
                  )}
              </select>
            </div>

            {/* In Stock toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Availability
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <span className="text-sm text-gray-700">In stock only</span>
              </label>
            </div>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <div className="self-end">
                <button
                  onClick={resetFilters}
                  className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <PackageSearch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filters.</p>
          <button onClick={resetFilters} className="text-sm text-brand-600 font-medium hover:underline">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={() => handlePage(filters.page - 1)}
            disabled={filters.page <= 1}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <span className="text-sm text-gray-500">
            Page <span className="font-semibold text-gray-900">{pagination.page}</span> of{" "}
            <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
          </span>

          <button
            onClick={() => handlePage(filters.page + 1)}
            disabled={filters.page >= pagination.totalPages}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
