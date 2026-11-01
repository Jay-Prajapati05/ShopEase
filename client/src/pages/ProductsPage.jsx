import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { productApi } from "../api/product.api.js";
import ProductCard from "../components/features/products/ProductCard.jsx";
import ProductCardSkeleton from "../components/features/products/ProductCardSkeleton.jsx";
import ProductFiltersSidebar from "../components/features/products/ProductFiltersSidebar.jsx";

// Whitelisted sort options matching backend product service
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "rating_desc", label: "Customer Rating: High to Low" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A–Z" },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    sort: searchParams.get("sort") || "newest",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minRating: searchParams.get("minRating") || "",
    inStock: searchParams.get("inStock") === "true",
    page: Number(searchParams.get("page")) || 1,
  });

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debounceRef = useRef(null);

  // Sync state if URL query parameters change (e.g. from Navbar global search or CategoryBar)
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const minRating = searchParams.get("minRating") || "";
    const inStock = searchParams.get("inStock") === "true";
    const page = Number(searchParams.get("page")) || 1;

    setSearchInput(search);
    setFilters({
      search,
      category,
      sort,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      page,
    });
  }, [searchParams]);

  // Fetch distinct category catalog
  useEffect(() => {
    let isMounted = true;
    productApi
      .getCategories()
      .then((data) => {
        if (isMounted) setCategories(data.data.categories || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products query
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
      if (activeFilters.minPrice) params.minPrice = activeFilters.minPrice;
      if (activeFilters.maxPrice) params.maxPrice = activeFilters.maxPrice;
      if (activeFilters.minRating) params.minRating = activeFilters.minRating;
      if (activeFilters.inStock) params.inStock = "true";

      const data = await productApi.getProducts(params);
      setProducts(data.data.products || []);
      setPagination(data.data.pagination || null);
    } catch (err) {
      setError("Unable to load products. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync filters to URL & trigger fetch
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.sort && filters.sort !== "newest") params.sort = filters.sort;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.minRating) params.minRating = filters.minRating;
    if (filters.inStock) params.inStock = "true";
    if (filters.page > 1) params.page = String(filters.page);

    setSearchParams(params, { replace: true });
    fetchProducts(filters);
  }, [filters, fetchProducts, setSearchParams]);

  // Handle live search input change (500ms debounce)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value.trim(), page: 1 }));
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setFilters((prev) => ({ ...prev, search: "", page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      category: "",
      sort: "newest",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      inStock: false,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Active filter count for badge
  const activeFiltersList = [];
  if (filters.category) {
    activeFiltersList.push({
      key: "category",
      label: `Category: ${filters.category}`,
    });
  }
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? `₹${filters.minPrice}` : "₹0";
    const max = filters.maxPrice ? `₹${filters.maxPrice}` : "Any";
    activeFiltersList.push({
      key: "price",
      label: `Price: ${min} – ${max}`,
    });
  }
  if (filters.minRating) {
    activeFiltersList.push({
      key: "minRating",
      label: `Rating: ${filters.minRating}★ & above`,
    });
  }
  if (filters.inStock) {
    activeFiltersList.push({
      key: "inStock",
      label: "In Stock Only",
    });
  }
  if (filters.search) {
    activeFiltersList.push({
      key: "search",
      label: `Search: "${filters.search}"`,
    });
  }

  const handleRemoveChip = (key) => {
    if (key === "price") {
      setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "", page: 1 }));
    } else if (key === "search") {
      setSearchInput("");
      setFilters((prev) => ({ ...prev, search: "", page: 1 }));
    } else if (key === "inStock") {
      setFilters((prev) => ({ ...prev, inStock: false, page: 1 }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: "", page: 1 }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-full">
      {/* 1. Page Header & Live Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Explore All Products
          </h1>
          {pagination && !loading && (
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Showing{" "}
              <strong className="text-gray-900">
                {products.length > 0 ? (filters.page - 1) * 12 + 1 : 0}–
                {Math.min(filters.page * 12, pagination.total)}
              </strong>{" "}
              of <strong className="text-gray-900">{pagination.total}</strong> products
            </p>
          )}
        </div>

        {/* Mobile Filter Toggle & Sort Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
            <span>Filters</span>
            {activeFiltersList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-500 text-gray-950 font-black text-[10px] flex items-center justify-center">
                {activeFiltersList.length}
              </span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-xs font-semibold text-gray-500 hidden sm:inline">
              Sort by:
            </span>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              aria-label="Sort products"
              className="text-xs sm:text-sm font-semibold bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs cursor-pointer w-full sm:w-auto"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Active Filter Chips Row */}
      {activeFiltersList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-gray-50 rounded-2xl border border-gray-200/60 shadow-2xs">
          <span className="text-xs font-bold text-gray-500 mr-1">Active Filters:</span>
          {activeFiltersList.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => handleRemoveChip(chip.key)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-800 px-2.5 py-1 rounded-lg hover:border-red-300 hover:text-red-700 shadow-2xs group transition cursor-pointer"
            >
              <span>{chip.label}</span>
              <X className="w-3 h-3 text-gray-400 group-hover:text-red-600" />
            </button>
          ))}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline ml-auto flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      {/* 3. Main Workspace: Sticky Desktop Sidebar + Product Grid */}
      <div className="flex items-start gap-6 lg:gap-8">
        {/* Desktop Sticky Filters Sidebar */}
        <div className="hidden md:block">
          <ProductFiltersSidebar
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            activeCount={activeFiltersList.length}
          />
        </div>

        {/* Product Grid / Loading / Empty State */}
        <main className="flex-1 min-w-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {Array.from({ length: 12 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Useful No-Results / Empty State */
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-2xs">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-50 rounded-3xl flex items-center justify-center mb-4 text-brand-600 border border-brand-200/60 shadow-xs">
                <PackageSearch className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
              </div>
              <h3 className="text-base sm:text-xl font-black text-gray-900 mb-1.5">
                No matching products found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                We couldn't find any items matching your active criteria. Try removing some filters, adjusting your price range, or searching for broader terms.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold bg-brand-500 hover:bg-brand-400 text-gray-950 px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* 4. Commercial Pagination Controls */}
          {pagination && pagination.totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-10 sm:mt-12 select-none">
              <button
                type="button"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                aria-label="Previous Page"
                className="flex items-center gap-1 text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 font-medium px-2">
                <span>Page</span>
                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                  {pagination.page}
                </span>
                <span>of</span>
                <span className="font-bold text-gray-900">{pagination.totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= pagination.totalPages}
                aria-label="Next Page"
                className="flex items-center gap-1 text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 5. Mobile Slide-Over Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Slide-over Content */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Filters</h3>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ProductFiltersSidebar
                categories={categories}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                activeCount={activeFiltersList.length}
                isMobile={true}
                onCloseMobile={() => setShowMobileFilters(false)}
              />
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-2.5 text-xs font-black bg-brand-500 text-gray-950 rounded-xl shadow-xs"
              >
                Apply & View Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
