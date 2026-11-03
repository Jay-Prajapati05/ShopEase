import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ShieldCheck,
  Edit2,
  Trash2,
  ThumbsUp,
  User,
  Star,
} from "lucide-react";
import Rating from "../../common/Rating.jsx";
import { productApi } from "../../../api/product.api.js";

/**
 * ProductReviewSection
 *
 * Customer reviews & verified buyer ratings with form to submit/edit/delete.
 */
export default function ProductReviewSection({
  product,
  onProductUpdate,
  user,
  isAuthenticated,
}) {
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

  // Check verified buyer review eligibility
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && product?._id) {
      setReviewStatusLoading(true);
      productApi
        .getReviewStatus(product._id)
        .then((res) => {
          if (isMounted && res.data) {
            setReviewStatus(res.data);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setReviewStatusLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, product?._id]);

  const handleStartEdit = () => {
    const existing = (product.reviews || []).find(
      (r) => r.user?.toString() === user?._id?.toString()
    );
    if (existing) {
      setNewRating(existing.rating);
      setNewComment(existing.comment);
      setIsEditingReview(true);
      setReviewError("");
      setReviewSuccess("");
      setTimeout(() => {
        document
          .getElementById("review-form-card")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingReview(false);
    setNewRating(5);
    setNewComment("");
    setReviewError("");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (newRating < 1 || newRating > 5) {
      setReviewError("Please choose a rating between 1 and 5 stars.");
      return;
    }
    if (!newComment.trim()) {
      setReviewError("Please write a comment for your review.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      if (isEditingReview) {
        const res = await productApi.updateReview(product._id, {
          rating: newRating,
          comment: newComment.trim(),
        });
        if (res.data?.product) {
          onProductUpdate(res.data.product);
        }
        setReviewSuccess("Review updated successfully!");
        setIsEditingReview(false);
      } else {
        const res = await productApi.createReview(product._id, {
          rating: newRating,
          comment: newComment.trim(),
        });
        if (res.data?.product) {
          onProductUpdate(res.data.product);
        }
        setReviewSuccess("Thank you! Your review has been published.");
        setReviewStatus((prev) => ({
          ...prev,
          canReview: false,
          hasReviewed: true,
        }));
      }
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      setReviewError(
        err.response?.data?.message || "Failed to submit review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your review?")) {
      return;
    }
    setSubmittingReview(true);
    setReviewError("");
    setReviewSuccess("");
    try {
      const res = await productApi.deleteReview(product._id);
      if (res.data?.product) {
        onProductUpdate(res.data.product);
      }
      setReviewSuccess("Review removed successfully.");
      setIsEditingReview(false);
      setReviewStatus((prev) => ({
        ...prev,
        canReview: true,
        hasReviewed: false,
      }));
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      setReviewError(
        err.response?.data?.message || "Failed to delete review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <section className="mt-14 sm:mt-18 pt-10 border-t border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real feedback from verified buyers who purchased this product
          </p>
        </div>

        {product.numReviews > 0 && (
          <div className="flex items-center gap-3 bg-brand-50/80 border border-brand-200/80 px-4 py-2.5 rounded-2xl w-fit shadow-2xs">
            <span className="text-2xl sm:text-3xl font-black text-brand-800">
              {(product.rating || 0).toFixed(1)}
            </span>
            <div>
              <Rating value={product.rating || 0} size="sm" />
              <span className="text-[11px] text-brand-900 font-bold block mt-0.5">
                {product.numReviews} verified {product.numReviews === 1 ? "rating" : "ratings"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Rating breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Rating Breakdown</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = (product.reviews || []).filter((r) => r.rating === star).length;
              const percentage = product.numReviews
                ? Math.round((count / product.numReviews) * 100)
                : 0;
              return (
                <div key={star} className="flex items-center gap-2.5 text-xs">
                  <span className="w-10 font-bold text-gray-700 flex items-center gap-0.5">
                    {star} <span className="text-amber-500">★</span>
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-7 text-right text-gray-400 font-medium text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Eligibility Alert */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            {!isAuthenticated ? (
              <div className="bg-gray-50 rounded-xl p-3.5 text-center border border-gray-100">
                <p className="text-xs text-gray-600 mb-2 font-medium">Bought this product?</p>
                <Link
                  to="/login"
                  className="inline-block px-3.5 py-1.5 text-xs font-bold text-brand-800 bg-brand-100 hover:bg-brand-200 rounded-lg transition"
                >
                  Sign in to review
                </Link>
              </div>
            ) : reviewStatusLoading ? (
              <div className="text-center py-2 text-xs text-gray-400 animate-pulse font-medium">
                Checking review status...
              </div>
            ) : reviewStatus.hasReviewed && !isEditingReview ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-900 flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  You reviewed this product
                </span>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>
            ) : reviewStatus.isVerifiedBuyer ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="font-bold">Verified Buyer — Share your feedback below!</span>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Only verified purchasers can submit a review.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Form + Reviews Listing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Form (For eligible verified buyers) */}
          {isAuthenticated && (reviewStatus.canReview || isEditingReview) && (
            <div
              id="review-form-card"
              className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-2xs scroll-mt-24"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  {isEditingReview ? "Update Your Review" : "Write a Verified Review"}
                </h3>
                {isEditingReview && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteReview}
                      disabled={submittingReview}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {reviewError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl">
                  {reviewSuccess}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Your Rating
                  </label>
                  <Rating
                    interactive
                    value={newRating}
                    onChange={setNewRating}
                    size="md"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Your Review Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength={1000}
                    required
                    placeholder="Share how the product performed, its quality, and whether you recommend it..."
                    className="w-full p-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                  <div className="text-right text-[10px] text-gray-400 mt-0.5">
                    {newComment.length}/1000 characters
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-gray-950 font-black text-xs rounded-xl transition shadow-2xs cursor-pointer"
                >
                  {submittingReview
                    ? "Saving..."
                    : isEditingReview
                    ? "Update Review"
                    : "Post Review"}
                </button>
              </form>
            </div>
          )}

          {/* Customer Reviews List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              Customer Feedback ({product.reviews?.length || 0})
            </h3>

            {(!product.reviews || product.reviews.length === 0) ? (
              <div className="p-8 sm:p-10 bg-white rounded-2xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-1">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <p className="text-xs font-bold text-gray-800">
                  No Written Reviews Yet
                </p>
                <p className="text-[11px] text-gray-500 max-w-sm">
                  Verified buyers who purchased this item can share their ratings and experience above!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {product.reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 font-bold text-xs flex items-center justify-center">
                          {rev.name?.[0]?.toUpperCase() || "C"}
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          {rev.name || "Customer"}
                        </span>
                        {rev.isVerifiedBuyer && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/60">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <Rating value={rev.rating} size="sm" />
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pl-9">
                      {rev.comment}
                    </p>

                    {rev.createdAt && (
                      <p className="text-[10px] text-gray-400 pl-9">
                        Reviewed on {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

