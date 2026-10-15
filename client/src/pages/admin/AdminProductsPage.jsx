import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  UploadCloud,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import adminApi from "../../api/admin.api.js";

const DEFAULT_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  brand: "",
  countInStock: "",
  images: [], // array of { url, public_id }
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete confirmation modal
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getProducts({ page, limit: 10, search: search.trim() });
      setProducts(res.data?.products || []);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(DEFAULT_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "",
      brand: product.brand || "",
      countInStock: product.countInStock ?? "",
      images: Array.isArray(product.images) ? [...product.images] : [],
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side quick check
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormErrors((prev) => ({
        ...prev,
        image: "Only JPEG, PNG, and WebP images are supported.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        image: "File size exceeds the 5MB limit.",
      }));
      return;
    }

    setUploadingImage(true);
    setFormErrors((prev) => ({ ...prev, image: "" }));

    try {
      const res = await adminApi.uploadImage(file);
      const uploaded = res.data; // { url, public_id }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, uploaded],
      }));
    } catch (err) {
      setFormErrors((prev) => ({
        ...prev,
        image: err?.response?.data?.message || "Image upload failed.",
      }));
    } finally {
      setUploadingImage(false);
      // Reset input so same file can be re-uploaded if desired
      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Product name is required";
    if (!formData.description.trim()) errs.description = "Description is required";
    if (formData.price === "" || Number(formData.price) < 0) {
      errs.price = "Valid non-negative price is required";
    }
    if (!formData.category.trim()) errs.category = "Category is required";
    if (
      formData.countInStock === "" ||
      !Number.isInteger(Number(formData.countInStock)) ||
      Number(formData.countInStock) < 0
    ) {
      errs.countInStock = "Valid stock count (integer >= 0) is required";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category.trim(),
      brand: formData.brand.trim(),
      countInStock: Number(formData.countInStock),
      images: formData.images,
    };

    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormErrors((prev) => ({
        ...prev,
        form: err?.response?.data?.message || "Failed to save product.",
      }));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteProduct(deleteId);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Products Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, update catalog inventory and upload high-res images
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search products by title, category, or brand..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full text-sm outline-none placeholder-gray-400"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
            <p className="text-xs text-gray-400">Loading catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No products found</p>
            <p className="text-xs text-gray-400 mt-1">
              Add your first product to get your store inventory started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Stock</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const image = p.images?.[0]?.url;
                  const isLowStock = p.countInStock <= 5;

                  return (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {image ? (
                              <img
                                src={image}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">
                              Brand: {p.brand || "Generic"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-gray-600 font-medium">
                        {p.category}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-gray-900 text-xs sm:text-sm">
                        ₹{p.price?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            p.countInStock === 0
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : isLowStock
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-green-50 text-green-700 border border-green-200"
                          }`}
                        >
                          {p.countInStock === 0 ? "Out of Stock" : `${p.countInStock} in stock`}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p._id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Fill in product specifications and upload images to Cloudinary.
            </p>

            {formErrors.form && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                {formErrors.form}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product features, materials, and specifications..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                />
                {formErrors.description && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Price & Stock Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 1999"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {formErrors.price && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Inventory Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.countInStock}
                    onChange={(e) => setFormData({ ...formData, countInStock: e.target.value })}
                    placeholder="e.g. 25"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {formErrors.countInStock && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.countInStock}</p>
                  )}
                </div>
              </div>

              {/* Category & Brand Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Electronics, Footwear, Fashion"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {formErrors.category && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Brand (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Sony, Nike, Apple"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Product Images (Cloudinary)
                </label>

                {/* Upload drag/drop box */}
                <label className="border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-brand-50/30 transition-all">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <div className="flex items-center gap-2 text-brand-600 text-sm font-semibold">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading image to Cloudinary...
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-1.5" />
                      <span className="text-xs font-semibold text-brand-600">
                        Click to upload
                      </span>{" "}
                      <span className="text-xs text-gray-500">or drag and drop</span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        JPEG, PNG, or WebP (max 5MB)
                      </p>
                    </div>
                  )}
                </label>
                {formErrors.image && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.image}</p>
                )}

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded-xl border border-gray-200 overflow-hidden group shadow-sm"
                      >
                        <img
                          src={img.url}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving Product..." : editingId ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Product?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete this product? All associated Cloudinary images will also be purged permanently.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
