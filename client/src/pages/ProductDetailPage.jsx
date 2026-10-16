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
} from "lucide-react";
import { productApi } from "../api/product.api.js";
import { useCart } from "../hooks/useCart.js";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, getItemQty, isInCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justAdded, setJustAdded] = useState(false);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            {product.name}
          </h1>

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
    </div>
  );
}
