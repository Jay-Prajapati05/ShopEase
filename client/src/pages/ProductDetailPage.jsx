import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ShoppingCart,
  Check,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  Plus,
  Minus,
  Edit2,
  Trash2,
} from "lucide-react";
import { productApi } from "../api/product.api.js";
import { useCart } from "../hooks/useCart.js";
import { useAuth } from "../hooks/useAuth.js";
import Rating from "../components/common/Rating.jsx";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, getItemQty, isInCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  // Review states
  const [reviewStatus, setReviewStatus] = useState({
    canReview: false,
    hasReviewed: false,
    isVerifiedBuyer: false,
  });
  const [reviewStatusLoading, setReviewStatusLoading] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    productApi
      .getProductById(id)
      .then((res) => {
        if (isMounted) {
          setProduct(res.data.product);
          setSelectedImage(0);
          setQty(1);
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

  // Load review status when authenticated
  useEffect(() => {
    if (isAuthenticated && id) {
      setReviewStatusLoading(true);
      productApi
        .getReviewStatus(id)
        .then((res) => {
          setReviewStatus(res.data);
        })
        .catch(() => {
          setReviewStatus({
            canReview: false,
            hasReviewed: false,
            isVerifiedBuyer: false,
          });
        })
        .finally(() => {
          setReviewStatusLoading(false);
        });
    } else {
      setReviewStatus({
        canReview: false,
        hasReviewed: false,
        isVerifiedBuyer: false,
      });
    }
  }, [isAuthenticated, id]);

  const handleStartEdit = (existingReview) => {
    const rev =
      existingReview ||
      product?.reviews?.find(
        (r) =>
          r.user === user?._id ||
          r.user?._id === user?._id ||
          r.user?.toString() === user?._id?.toString()
      );

    if (rev) {
      setNewRating(rev.rating || 5);
      setNewComment(rev.comment || "");
      setIsEditingReview(true);
      setReviewError("");
      setReviewSuccess("");

      const el = document.getElementById("review-form-card");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditingReview(false);
    setNewRating(5);
    setNewComment("");
    setReviewError("");
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      setSubmittingReview(true);
      const res = await productApi.deleteReview(id);
      setProduct(res.data.product);
      setReviewSuccess("Your review has been removed.");
      setIsEditingReview(false);
      setNewRating(5);
      setNewComment("");
      setReviewStatus((prev) => ({
        ...prev,
        canReview: true,
        hasReviewed: false,
      }));
      setTimeout(() => setReviewSuccess(""), 5000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete review";
      setReviewError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!newComment.trim()) {
      setReviewError("Please write a comment for your review");
      return;
    }

    try {
      setSubmittingReview(true);
      if (isEditingReview) {
        const res = await productApi.updateReview(id, {
          rating: newRating,
          comment: newComment.trim(),
        });
        setProduct(res.data.product);
        setReviewSuccess("Your review has been updated successfully!");
        setIsEditingReview(false);
      } else {
        const res = await productApi.createReview(id, {
          rating: newRating,
          comment: newComment.trim(),
        });
        setProduct(res.data.product);
        setReviewSuccess("Thank you! Your review has been published.");
        setNewComment("");
        setReviewStatus((prev) => ({
          ...prev,
          canReview: false,
          hasReviewed: true,
        }));
      }
      setTimeout(() => setReviewSuccess(""), 5000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit review";
      setReviewError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentCartQty = product ? getItemQty(product._id) : 0;
  const maxAvailable = product ? Math.max(0, product.countInStock - currentCartQty) : 0;
  const isOutOfStock = product ? product.countInStock === 0 : false;
  const isMaxInCart = product ? currentCartQty >= product.countInStock && product.countInStock > 0 : false;

  const handleQtyChange = (newQty) => {
    if (newQty >= 1 && newQty <= maxAvailable) {
      setQty(newQty);
    }
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock || isMaxInCart || qty < 1) return;
    addItem(product, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
    // Reset qty if current qty would exceed remaining stock
    const remainingAfterAdd = maxAvailable - qty;
    setQty(remainingAfterAdd > 0 ? 1 : 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded-full" />
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-10 w-40 bg-gray-200 rounded mt-6" />
            <div className="h-24 w-full bg-gray-200 rounded mt-6" />
            <div className="h-12 w-48 bg-gray-200 rounded mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">{error || "The product you requested does not exist."}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-brand-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImageUrl = images[selectedImage]?.url || "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Back Navigation */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-600 transition-colors">Products</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Package className="w-16 h-16 stroke-1 mb-2" />
                <span className="text-sm">No image available</span>
              </div>
            )}

            {isOutOfStock && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                Out of Stock
              </span>
            )}
          </div>

          {/* Thumbnail row if multiple images */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.public_id || idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === idx
                      ? "border-brand-600 ring-2 ring-brand-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details */}
        <div className="flex flex-col">
          {/* Category & Brand */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full capitalize">
              {product.category}
            </span>
            {product.brand && (
              <span className="text-xs font-medium text-gray-500">
                Brand: <strong className="text-gray-700">{product.brand}</strong>
              </span>
            )}
          </div>

          {/* Product Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            {product.name}
          </h1>

          {/* Rating summary badge */}
          <div className="flex items-center gap-2 mb-4">
            <Rating
              value={product.rating || 0}
              text={`${(product.rating || 0).toFixed(1)} (${product.numReviews || 0} ${
                product.numReviews === 1 ? "review" : "reviews"
              })`}
              size="sm"
            />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 pb-6 border-b border-gray-100 mb-6">
            <span className="text-3xl font-extrabold text-gray-900">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-gray-400">Inclusive of all taxes</span>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {isOutOfStock ? (
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                Currently Out of Stock
              </div>
            ) : product.countInStock <= 5 ? (
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                Only {product.countInStock} items left in stock
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                <Check className="w-4 h-4" />
                In Stock ({product.countInStock} available)
              </div>
            )}
          </div>

          {/* Quantity selector & Add to Cart */}
          {!isOutOfStock && (
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="inline-flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(qty - 1)}
                    disabled={qty <= 1 || maxAvailable === 0}
                    className="p-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-semibold text-gray-900 select-none">
                    {maxAvailable === 0 ? 0 : qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(qty + 1)}
                    disabled={qty >= maxAvailable || maxAvailable === 0}
                    className="p-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {currentCartQty > 0 && (
                  <span className="text-xs text-gray-500">
                    ({currentCartQty} already in cart)
                  </span>
                )}
              </div>

              {isMaxInCart && (
                <p className="text-xs text-amber-600">
                  You have already added all available stock ({product.countInStock}) to your cart.
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isMaxInCart || maxAvailable === 0}
                  className={`flex-1 inline-flex items-center justify-center gap-2 font-black px-6 py-4 rounded-xl transition-all shadow-md ${
                    justAdded
                      ? "bg-green-600 text-white"
                      : isMaxInCart || maxAvailable === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      : "bg-brand-500 text-gray-950 hover:bg-brand-600 hover:text-white hover:shadow-lg active:scale-[0.98]"
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-5 h-5 stroke-[2.5]" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </button>

                {isInCart(product._id) && (
                  <Link
                    to="/cart"
                    className="inline-flex items-center justify-center font-bold px-6 py-4 rounded-xl border border-brand-300 text-brand-900 bg-brand-50 hover:bg-brand-100 transition-colors shadow-xs"
                  >
                    View Cart ({currentCartQty})
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Product Description */}
          <div className="border-t border-gray-100 pt-6 space-y-3 mb-8">
            <h2 className="text-base font-semibold text-gray-900">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Guarantees / Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-900">Fast Shipping</h4>
                <p className="text-[11px] text-gray-500">Delivered in 3-5 days</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-900">Genuine Quality</h4>
                <p className="text-[11px] text-gray-500">100% verified products</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-900">Easy Returns</h4>
                <p className="text-[11px] text-gray-500">7 days return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <section className="mt-16 pt-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Customer Reviews & Ratings</h2>
            <p className="text-sm text-slate-500 mt-1">
              Real feedback from verified buyers who purchased this product.
            </p>
          </div>
          {product.numReviews > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/60 px-4 py-2.5 rounded-xl">
              <span className="text-2xl font-black text-amber-700">
                {(product.rating || 0).toFixed(1)}
              </span>
              <div>
                <Rating value={product.rating || 0} size="sm" />
                <span className="text-xs text-amber-800 font-medium">
                  {product.numReviews} verified {product.numReviews === 1 ? "rating" : "ratings"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Rating breakdown / Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Rating Breakdown</h3>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = (product.reviews || []).filter((r) => r.rating === star).length;
                const percentage = product.numReviews ? Math.round((count / product.numReviews) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-medium text-slate-700 flex items-center gap-1">
                      {star} <span className="text-amber-500">★</span>
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-400 font-mono">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Review Status Box */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              {!isAuthenticated ? (
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                  <p className="text-xs text-slate-600 mb-2">Have you bought this item?</p>
                  <Link
                    to="/login"
                    className="inline-block px-4 py-2 text-xs font-bold text-amber-700 bg-amber-100/60 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    Sign in to leave a review
                  </Link>
                </div>
              ) : reviewStatusLoading ? (
                <div className="text-center py-3 text-xs text-slate-400 animate-pulse">
                  Checking review eligibility...
                </div>
              ) : reviewStatus.hasReviewed && !isEditingReview ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>You reviewed this product</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartEdit()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg transition-colors shadow-2xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit Review
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Want to change your rating stars or description? Click Edit Review.
                  </p>
                </div>
              ) : reviewStatus.isVerifiedBuyer ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>You are a verified buyer! Share your review below.</span>
                </div>
              ) : (
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>Only verified buyers who purchased this product can leave a review.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Review Submission Form + Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informational card for non-buyers (Option B) */}
            {isAuthenticated && !reviewStatusLoading && !reviewStatus.isVerifiedBuyer && !reviewStatus.hasReviewed && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Verified Buyers Only</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Only customers who have purchased and paid for this item can write a review. Once your order is confirmed or delivered, your review form will unlock here automatically!
                  </p>
                </div>
              </div>
            )}

            {/* Informational card for guests */}
            {!isAuthenticated && (
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 text-center shadow-xs">
                <p className="text-sm font-bold text-slate-900">Want to review this product?</p>
                <p className="text-xs text-slate-600 mt-1 mb-3">
                  Only verified buyers who have purchased this item can share reviews.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs rounded-xl transition-colors shadow-2xs"
                >
                  Sign in to check eligibility
                </Link>
              </div>
            )}

            {/* Form (Only for verified buyers who haven't reviewed, or editing existing review) */}
            {isAuthenticated && (reviewStatus.canReview || isEditingReview) && (
              <div
                id="review-form-card"
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm scroll-mt-24"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-base font-bold text-slate-900">
                    {isEditingReview ? "Edit Your Review" : "Write a Customer Review"}
                  </h3>
                  {isEditingReview && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteReview}
                        disabled={submittingReview}
                        className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  {isEditingReview
                    ? "Update your rating stars and description for this product below."
                    : "Rate your purchase and describe your experience for other shoppers."}
                </p>

                {reviewError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
                    {reviewSuccess}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Your Rating
                    </label>
                    <Rating
                      interactive
                      value={newRating}
                      onChange={setNewRating}
                      size="lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Review
                    </label>
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      maxLength={1000}
                      required
                      placeholder="What did you like or dislike about this product? How is the quality?"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                    <div className="text-right text-[11px] text-slate-400 mt-1">
                      {newComment.length}/1000 characters
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {submittingReview ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : isEditingReview ? (
                        "Update Review"
                      ) : (
                        "Submit Review"
                      )}
                    </button>

                    {isEditingReview && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={submittingReview}
                        className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* List of customer reviews */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                All Reviews ({(product.reviews || []).length})
              </h3>

              {(!product.reviews || product.reviews.length === 0) ? (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center">
                  <p className="text-sm font-semibold text-slate-700">No reviews yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Be the first verified customer to share feedback on this product!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {product.reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                            {rev.name ? rev.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {rev.name}
                              </span>
                              {rev.isVerifiedBuyer ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  <Check className="w-3 h-3" />
                                  Verified Buyer
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  Customer
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {rev.createdAt
                                ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "Recent"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Rating value={rev.rating} size="sm" />
                          {isAuthenticated &&
                            (rev.user === user?._id ||
                              rev.user?._id === user?._id ||
                              rev.user?.toString() === user?._id?.toString()) && (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(rev)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors ml-1"
                                title="Edit your review"
                              >
                                <Edit2 className="w-3 h-3 text-amber-700" />
                                Edit
                              </button>
                            )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pl-10">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
