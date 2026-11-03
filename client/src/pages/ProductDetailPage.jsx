import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ShoppingCart,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  Zap,
} from "lucide-react";
import { productApi } from "../api/product.api.js";
import { useCart } from "../hooks/useCart.js";
import { useAuth } from "../hooks/useAuth.js";
import Rating from "../components/common/Rating.jsx";
import ProductImageGallery from "../components/features/products/ProductImageGallery.jsx";
import ProductPriceBlock from "../components/features/products/ProductPriceBlock.jsx";
import ProductPolicyCard from "../components/features/products/ProductPolicyCard.jsx";
import ProductReviewSection from "../components/features/products/ProductReviewSection.jsx";
import ProductCarousel from "../components/features/products/ProductCarousel.jsx";
import ProductCardSkeleton from "../components/features/products/ProductCardSkeleton.jsx";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, getItemQty, isInCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  // Fetch product by ID
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    productApi
      .getProductById(id)
      .then((res) => {
        if (isMounted && res.data?.product) {
          const prod = res.data.product;
          setProduct(prod);
          setQty(1);

          // Fetch similar products in the same category
          if (prod.category) {
            setLoadingRelated(true);
            productApi
              .getProducts({ category: prod.category, limit: 8 })
              .then((relRes) => {
                if (isMounted) {
                  const filtered = (relRes.data?.products || []).filter(
                    (p) => p._id !== prod._id
                  );
                  setRelatedProducts(filtered);
                }
              })
              .catch(() => {})
              .finally(() => {
                if (isMounted) setLoadingRelated(false);
              });
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          const status = err.response?.status;
          if (status === 404) {
            setError("Product not found. It may have been removed.");
          } else {
            setError("Failed to load product details. Please try again.");
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-pulse space-y-8">
        <div className="h-4 w-40 bg-gray-200 rounded-md" />
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5 aspect-[4/3] sm:aspect-square max-h-[460px] w-full bg-gray-200 rounded-2xl sm:rounded-3xl" />
            <div className="lg:col-span-7 space-y-4">
              <div className="h-5 w-24 bg-gray-200 rounded-full" />
              <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
              <div className="h-6 w-32 bg-gray-200 rounded-md" />
              <div className="h-10 w-48 bg-gray-200 rounded-xl" />
              <div className="h-32 bg-gray-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {error || "Product Not Found"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          The item you are looking for does not exist or has been discontinued.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-xs rounded-xl shadow-xs transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.countInStock === 0;
  const currentCartQty = getItemQty(product._id);
  const remainingStock = Math.max(0, product.countInStock - currentCartQty);
  const inCart = isInCart(product._id);

  const handleAddToCart = () => {
    if (isOutOfStock || remainingStock < qty) return;
    addItem(product, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock || remainingStock < 1) return;
    if (!inCart) {
      addItem(product, qty);
    }
    navigate("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-full">
      {/* 1. Breadcrumb Trail */}
      <nav
        className="flex items-center gap-2 text-xs text-gray-400 mb-5 sm:mb-6 truncate"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-brand-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-600 transition-colors">
          Products
        </Link>
        <span>/</span>
        <Link
          to={`/products?category=${encodeURIComponent(product.category)}`}
          className="hover:text-brand-600 transition-colors capitalize"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-bold truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* 2. Main 2-Column Product Anatomy inside Unified Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-5 sm:p-8 shadow-2xs mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Interactive Image Gallery */}
          <div className="w-full lg:col-span-5 lg:sticky lg:top-24">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              isOutOfStock={isOutOfStock}
            />
          </div>

          {/* Right Column: Details, Price, Actions, Pincode & Overview */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Category & Brand Pills */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-brand-800 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-md capitalize">
                {product.category}
              </span>
              {product.brand && (
                <span className="text-xs text-gray-500 font-medium">
                  Brand: <strong className="text-gray-800">{product.brand}</strong>
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 pb-1">
              <Rating value={product.rating || 0} size="sm" />
              <span className="text-xs font-bold text-gray-800">
                {(product.rating || 0).toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                ({product.numReviews || 0} customer reviews)
              </span>
            </div>

            {/* Price & Discount Block */}
            <ProductPriceBlock
              price={product.price}
              originalPrice={product.originalPrice}
            />

            {/* Stock Status Indicator */}
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-bold text-gray-600">Availability:</span>
              {isOutOfStock ? (
                <span className="text-xs font-black text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md">
                  Currently Out of Stock
                </span>
              ) : remainingStock <= 5 ? (
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">
                  Hurry, only {remainingStock} left in stock!
                </span>
              ) : (
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-md">
                  In Stock ({product.countInStock} available)
                </span>
              )}
            </div>

            {/* Action Buttons: Quantity + Add to Cart + Buy Now (Right Column) */}
            {!isOutOfStock && remainingStock > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 pb-3 border-b border-gray-100">
                {/* Quantity Controls */}
                <div className="flex items-center justify-between sm:justify-start border border-gray-200 rounded-xl bg-gray-50/70 p-1 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="p-2 sm:p-1.5 rounded-lg hover:bg-white text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-900 w-8 text-center">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(remainingStock, q + 1))}
                    disabled={qty >= remainingStock}
                    className="p-2 sm:p-1.5 rounded-lg hover:bg-white text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 ${
                    justAdded
                      ? "bg-green-600 text-white"
                      : "bg-brand-500 hover:bg-brand-600 text-gray-950"
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                {/* Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now</span>
                </button>

                {inCart && (
                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="py-3 px-4 rounded-xl font-bold text-xs border border-gray-200 hover:bg-gray-50 text-gray-800 transition cursor-pointer text-center"
                  >
                    Go to Cart
                  </button>
                )}
              </div>
            )}

            {/* Delivery Options & Trust Badges */}
            <div className="pb-3 border-b border-gray-100">
              <ProductPolicyCard />
            </div>

            {/* Product Description */}
            <div className="pt-1 space-y-2">
              <h2 className="text-sm font-bold text-gray-900">Product Overview</h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Customer Reviews & Ratings Section */}
      <ProductReviewSection
        product={product}
        onProductUpdate={setProduct}
        user={user}
        isAuthenticated={isAuthenticated}
      />

      {/* 4. Similar / Related Products Slider */}
      {relatedProducts.length > 0 && (
        <section className="mt-14 sm:mt-18 pt-10 border-t border-gray-100">
          <ProductCarousel
            title={`More in ${product.category}`}
            subtitle="Explore similar items handpicked from this category"
            badge="⚡ SIMILAR ITEMS"
            badgeIcon={Sparkles}
            products={relatedProducts}
            loading={loadingRelated}
            viewAllLink={`/products?category=${encodeURIComponent(product.category)}`}
          />
        </section>
      )}
    </div>
  );
}
