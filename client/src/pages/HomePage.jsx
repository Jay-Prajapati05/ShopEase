import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Package,
  Search,
  X,
} from "lucide-react";
import { productApi } from "../api/product.api.js";
import { useAuth } from "../hooks/useAuth.js";
import ProductCard from "../components/features/products/ProductCard.jsx";

// E-commerce Slider Banners (Amazon / Flipkart Style)
const SLIDES = [
  {
    id: 1,
    tag: "⚡ BIG VALUE DAYS",
    title: "Next-Gen Tech & Electronics",
    subtitle: "Upgrade to premium smartphones, wireless audio & high-performance laptops at honest prices.",
    ctaText: "Shop Electronics",
    ctaLink: "/products?category=Electronics",
    badge: "Up to 40% OFF",
    gradient: "from-slate-950 via-zinc-900 to-amber-950/40",
  },
  {
    id: 2,
    tag: "🚚 ZERO SHIPPING FEE",
    title: "Shop Smarter with ShopEase",
    subtitle: "Enjoy free doorstep delivery on all orders above ₹500 with real-time tracking.",
    ctaText: "Explore Catalog",
    ctaLink: "/products",
    badge: "Free Delivery Above ₹500",
    gradient: "from-slate-950 via-slate-900 to-zinc-900",
  },
  {
    id: 3,
    tag: "💵 100% PEACE OF MIND",
    title: "Cash on Delivery Available",
    subtitle: "Order your favorite products online and pay safely via cash or UPI right at your doorstep.",
    ctaText: "Start Shopping",
    ctaLink: "/products",
    badge: "COD Available",
    gradient: "from-zinc-950 via-slate-900 to-amber-950/30",
  },
  {
    id: 4,
    tag: "✨ NEW ARRIVALS",
    title: "Trendy Fashion & Daily Lifestyle",
    subtitle: "Discover top-rated apparel, stylish footwear & everyday essentials curated for you.",
    ctaText: "Explore Fashion",
    ctaLink: "/products?category=Fashion",
    badge: "Min. 50% OFF",
    gradient: "from-slate-950 via-zinc-900 to-amber-900/40",
  },
];

// Curated popular e-commerce categories list
const POPULAR_CATEGORIES = [
  "All Items",
  "Electronics",
  "Phones",
  "Laptops",
  "Fashion",
  "Footwear",
  "Appliances",
  "Accessories",
  "Beauty",
];

// Skeleton Card Loader for Home Page
function HomeProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-3 w-14 bg-gray-100 rounded-md" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 w-1/3 bg-gray-100 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-16 bg-gray-100 rounded" />
          <div className="h-8 w-14 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoriesList, setCategoriesList] = useState(POPULAR_CATEGORIES);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimerRef = useRef(null);

  // Debounced search handler (400ms)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(value.trim());
    }, 400);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  };

  // Auto-play Slider every 5 seconds (pauses on hover, resets on slide change)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, isPaused]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  // Fetch distinct categories from backend and append any custom ones
  useEffect(() => {
    let isMounted = true;
    productApi
      .getCategories()
      .then((res) => {
        if (!isMounted) return;
        const dbCats = res.data?.categories || [];
        if (dbCats.length > 0) {
          const standardLower = POPULAR_CATEGORIES.map((c) => c.toLowerCase());
          const newCustom = dbCats.filter(
            (c) =>
              !standardLower.includes(c.toLowerCase()) &&
              !standardLower.includes(c.toLowerCase().replace(/e?s$/, ""))
          );
          if (newCustom.length > 0) {
            setCategoriesList([...POPULAR_CATEGORIES, ...newCustom]);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch featured products for the Home Page (filtered in-place by category and search)
  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);

    const params = { limit: 12, sort: "newest" };
    if (selectedCategory) {
      params.category = selectedCategory;
    }
    if (searchQuery) {
      params.search = searchQuery;
    }

    productApi
      .getProducts(params)
      .then((res) => {
        if (isMounted) {
          setFeaturedProducts(res.data?.products || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingProducts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  const activeSlide = SLIDES[currentSlide];

  return (
    <div className="flex flex-col w-full max-w-full overflow-x-hidden">
      {/* 1. Dynamic Auto-Playing Hero Banner Carousel */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden bg-slate-950 text-white select-none"
      >
        {/* Animated Slide Content */}
        <div
          className={`relative bg-gradient-to-br ${activeSlide.gradient} transition-all duration-500 py-10 sm:py-16 md:py-20`}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-400/30 text-brand-300 rounded-full px-3.5 py-1 text-xs sm:text-sm font-bold mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 fill-brand-400 text-brand-400" />
              <span>{activeSlide.tag}</span>
              <span className="hidden sm:inline text-brand-400 font-normal">|</span>
              <span className="hidden sm:inline text-white/90 text-xs font-semibold">
                {activeSlide.badge}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4 max-w-3xl mx-auto leading-tight">
              {activeSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base md:text-lg text-gray-300 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              {activeSlide.subtitle}
            </p>

            {/* Action Buttons (Aware of User Authentication state) */}
            <div className="flex items-center justify-center gap-3 max-w-sm sm:max-w-none mx-auto">
              <Link
                to={activeSlide.ctaLink}
                className="inline-flex items-center justify-center gap-2 bg-brand-500 text-gray-950 font-black px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl hover:bg-brand-400 transition-all shadow-md hover:shadow-brand-500/20 active:scale-[0.98] text-xs sm:text-sm"
              >
                {activeSlide.ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/my-orders"
                  className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white font-bold px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl border border-white/20 transition-all text-xs sm:text-sm"
                >
                  <Package className="w-4 h-4 text-brand-400" />
                  My Orders
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center bg-white/10 hover:bg-white/15 text-white font-bold px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl border border-white/20 transition-all text-xs sm:text-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Left & Right Arrow Buttons */}
          <button
            type="button"
            onClick={handlePrevSlide}
            aria-label="Previous slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-all backdrop-blur-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNextSlide}
            aria-label="Next slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-all backdrop-blur-xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slider Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full h-1.5 ${
                  currentSlide === index
                    ? "w-7 bg-brand-400"
                    : "w-2 bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Quick Search & Category Chips Bar */}
      <section className="bg-white border-b border-gray-100 py-3.5 sm:py-5 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
          {/* Prominent Live Search Input */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search products by name, brand, or category (e.g. Dell, Mi, Bluetooth)..."
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all shadow-inner placeholder:text-gray-400"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline flex-shrink-0">
              Categories:
            </span>
            {categoriesList.map((cat) => {
              const isSelected =
                (cat === "All Items" && !selectedCategory) ||
                selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(cat === "All Items" ? "" : cat)
                  }
                  className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    isSelected
                      ? "bg-brand-500 text-gray-950 font-black shadow-xs ring-2 ring-brand-300 scale-[1.02]"
                      : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-brand-500 hover:text-brand-800 hover:bg-brand-50 active:scale-95"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. 🔥 Trending / Featured Products Section (With Skeleton Loader) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200/80 w-fit mb-1.5">
              <Flame className="w-3.5 h-3.5 text-brand-600 fill-brand-500" />
              <span>
                {searchQuery
                  ? `Search: "${searchQuery}"`
                  : selectedCategory
                  ? selectedCategory
                  : "Trending Now"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory
                ? `${selectedCategory} Collection`
                : "Featured Products & Deals"}
            </h2>
          </div>
          <Link
            to={
              searchQuery && selectedCategory
                ? `/products?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`
                : searchQuery
                ? `/products?search=${encodeURIComponent(searchQuery)}`
                : selectedCategory
                ? `/products?category=${encodeURIComponent(selectedCategory)}`
                : "/products"
            }
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Products Grid or Skeleton Loader */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            <HomeProductSkeleton />
            <HomeProductSkeleton />
            <HomeProductSkeleton />
            <HomeProductSkeleton />
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6 max-w-md mx-auto">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2.5" />
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              {searchQuery
                ? `No products found for "${searchQuery}"`
                : `No products found in "${selectedCategory}"`}
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              {searchQuery
                ? "Try checking for typos or use different keywords like phone, laptop, or brand name."
                : "New items will be arriving soon. You can explore other categories or view all products."}
            </p>
            <div className="flex items-center justify-center gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-950 bg-brand-500 hover:bg-brand-400 px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Search
                </button>
              )}
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Category
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4. Sleek Trust Highlights Strip */}
      <section className="bg-white border-y border-gray-100 py-6 sm:py-8 my-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50/60 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0 border border-brand-200/60">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Free & Fast Delivery</h3>
                <p className="text-xs text-gray-500">Free delivery on orders above ₹500</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50/60 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0 border border-brand-200/60">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">100% Genuine Items</h3>
                <p className="text-xs text-gray-500">Directly sourced verified products</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50/60 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0 border border-brand-200/60">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Hassle-Free COD</h3>
                <p className="text-xs text-gray-500">Pay with Cash or UPI upon arrival</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Compact CTA Footer Strip */}
      <section className="bg-slate-950 text-white py-10 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-black mb-2 text-white">
            Ready to upgrade your shopping experience?
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
            Discover amazing deals, build your cart, and get quick delivery across India.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-brand-500 text-gray-950 font-black px-7 py-3 rounded-xl hover:bg-brand-400 transition-all shadow-md text-xs sm:text-sm active:scale-[0.98]"
          >
            Explore Full Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}


