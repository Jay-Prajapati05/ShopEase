import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";
import pick from "../utils/pick.js";
import escapeRegex from "../utils/escapeRegex.js";
import { deleteImages } from "./upload.service.js";

const WRITABLE_FIELDS = [
  "name",
  "description",
  "price",
  "originalPrice",
  "category",
  "brand",
  "images",
  "countInStock",
];

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  rating_desc: { rating: -1 },
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const MAX_SEARCH_LENGTH = 100;

const asString = (value) => (typeof value === "string" ? value.trim() : "");

const toPositiveInt = (value, fallback) => {
  const number = Number.parseInt(value, 10);
  return Number.isInteger(number) && number > 0 ? number : fallback;
};

const parsePrice = (value, name) => {
  if (value === undefined || value === "") return null;
  const number = typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(number) || number < 0) {
    throw ApiError.badRequest(`${name} must be a non-negative number`);
  }
  return number;
};

const findProductOrThrow = async (id) => {
  if (!mongoose.isValidObjectId(id))
    throw ApiError.notFound("Product not found");
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

export const getProducts = async (query = {}) => {
  const page = toPositiveInt(query.page, 1);
  const limit = Math.min(toPositiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT);

  const filter = {};

  const search = asString(query.search).slice(0, MAX_SEARCH_LENGTH);
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { brand: regex }, { category: regex }];
  }

  const category = asString(query.category);
  if (category) {
    const escaped = escapeRegex(category);
    const singular = escaped.replace(/e?s$/i, "");
    const pattern = singular.replace(/elec?tronic/i, "elec?tronic");
    filter.category = new RegExp(pattern, "i");
  }

  const minPrice = parsePrice(query.minPrice, "minPrice");
  const maxPrice = parsePrice(query.maxPrice, "maxPrice");
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw ApiError.badRequest("minPrice cannot be greater than maxPrice");
  }
  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null) filter.price.$gte = minPrice;
    if (maxPrice !== null) filter.price.$lte = maxPrice;
  }

  if (query.inStock === "true") filter.countInStock = { $gt: 0 };

  const minRating = Number(query.minRating);
  if (Number.isFinite(minRating) && minRating > 0 && minRating <= 5) {
    filter.rating = { $gte: minRating };
  }

  const sortKey = asString(query.sort);
  const sort = Object.hasOwn(SORT_OPTIONS, sortKey)
    ? SORT_OPTIONS[sortKey]
    : SORT_OPTIONS.newest;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ ...sort, _id: 1 }) // _id keeps pagination order stable
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-__v")
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getCategories = async () => {
  const categories = await Product.distinct("category");
  return categories.sort((a, b) => a.localeCompare(b));
};

export const getProductById = async (id) => {
  if (!mongoose.isValidObjectId(id))
    throw ApiError.notFound("Product not found");
  const product = await Product.findById(id).select("-__v").lean();
  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

const BESTSELLER_LIMIT = 10;
const MIN_REVIEWS_FOR_BESTSELLER = 1;

export const getBestsellerProducts = async () => {
  // Returns top-rated, in-stock products with at least one review.
  // Simple find+sort — no aggregation needed; fast on indexed `rating` field.
  const products = await Product.find({
    countInStock: { $gt: 0 },
    numReviews: { $gte: MIN_REVIEWS_FOR_BESTSELLER },
  })
    .sort({ rating: -1, numReviews: -1 })
    .limit(BESTSELLER_LIMIT)
    .select("-__v")
    .lean();

  return products;
};

export const createProduct = async (body) => {
  const data = pick(body ?? {}, WRITABLE_FIELDS);
  return Product.create(data);
};

export const updateProduct = async (id, body) => {
  const updates = pick(body ?? {}, WRITABLE_FIELDS);
  if (!Object.keys(updates).length) {
    throw ApiError.badRequest("No valid fields to update");
  }

  const product = await findProductOrThrow(id);

  // If new images array is supplied, delete any replaced images from Cloudinary (no orphaned assets)
  if (Array.isArray(updates.images)) {
    const newPublicIds = new Set(
      updates.images.map((img) => img?.public_id).filter(Boolean)
    );
    const removedImages = (product.images || []).filter(
      (img) => img?.public_id && !newPublicIds.has(img.public_id)
    );
    if (removedImages.length > 0) {
      deleteImages(removedImages);
    }
  }

  product.set(updates);
  await product.save(); // runs schema validators
  return product;
};

export const deleteProduct = async (id) => {
  if (!mongoose.isValidObjectId(id))
    throw ApiError.notFound("Product not found");
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw ApiError.notFound("Product not found");

  // Delete all associated images from Cloudinary upon product removal
  if (Array.isArray(product.images) && product.images.length > 0) {
    deleteImages(product.images);
  }

  return product;
};

export const getProductReviewStatus = async (productId, userId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw ApiError.notFound("Product not found");
  }

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound("Product not found");

  const hasReviewed = product.reviews.some(
    (r) => r.user.toString() === userId.toString()
  );

  const isVerifiedBuyer = Boolean(
    await Order.exists({
      user: userId,
      "orderItems.product": productId,
      $or: [{ isPaid: true }, { orderStatus: "Delivered" }],
    })
  );

  return {
    canReview: isVerifiedBuyer && !hasReviewed,
    hasReviewed,
    isVerifiedBuyer,
  };
};

export const createProductReview = async (
  productId,
  userId,
  { rating, comment, name }
) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw ApiError.notFound("Product not found");
  }

  // 1. Validation
  const numericRating = Number(rating);
  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw ApiError.badRequest("Rating must be an integer between 1 and 5");
  }

  if (typeof comment !== "string" || !comment.trim()) {
    throw ApiError.badRequest("Review comment is required");
  }
  if (comment.trim().length > 1000) {
    throw ApiError.badRequest("Review comment cannot exceed 1000 characters");
  }

  // 2. Check if product exists and if user already reviewed
  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound("Product not found");
  }

  const alreadyReviewed = product.reviews.some(
    (r) => r.user.toString() === userId.toString()
  );
  if (alreadyReviewed) {
    throw ApiError.badRequest("You have already reviewed this product");
  }

  // 3. Strict Verified Buyer check (Option B)
  const isVerifiedBuyer = Boolean(
    await Order.exists({
      user: userId,
      "orderItems.product": productId,
      $or: [{ isPaid: true }, { orderStatus: "Delivered" }],
    })
  );

  if (!isVerifiedBuyer) {
    throw ApiError.forbidden(
      "Only verified buyers who have purchased and received this product can leave a review"
    );
  }

  // 4. Calculate new aggregate rating and review count
  const newNumReviews = product.reviews.length + 1;
  const totalRating =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) + numericRating;
  const newAvgRating = Math.round((totalRating / newNumReviews) * 10) / 10;

  const newReview = {
    user: userId,
    name:
      name && typeof name === "string" ? name.trim() : "Customer",
    rating: numericRating,
    comment: comment.trim(),
    isVerifiedBuyer,
  };

  // 5. Atomic update: push review and update rating stats safely
  const updatedProduct = await Product.findOneAndUpdate(
    {
      _id: productId,
      "reviews.user": { $ne: userId },
    },
    {
      $push: { reviews: newReview },
      $set: { rating: newAvgRating, numReviews: newNumReviews },
    },
    { returnDocument: "after", select: "-__v" }
  );

  if (!updatedProduct) {
    throw ApiError.badRequest("You have already reviewed this product");
  }

  return updatedProduct;
};

export const updateProductReview = async (
  productId,
  userId,
  { rating, comment }
) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw ApiError.notFound("Product not found");
  }

  const numericRating = Number(rating);
  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw ApiError.badRequest("Rating must be an integer between 1 and 5");
  }

  if (typeof comment !== "string" || !comment.trim()) {
    throw ApiError.badRequest("Review comment is required");
  }
  if (comment.trim().length > 1000) {
    throw ApiError.badRequest("Review comment cannot exceed 1000 characters");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound("Product not found");
  }

  const reviewIndex = product.reviews.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  if (reviewIndex === -1) {
    throw ApiError.notFound("You have not reviewed this product yet");
  }

  // Update existing review fields
  product.reviews[reviewIndex].rating = numericRating;
  product.reviews[reviewIndex].comment = comment.trim();
  product.reviews[reviewIndex].updatedAt = new Date();

  // Recalculate average rating
  const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = Math.round((totalRating / product.reviews.length) * 10) / 10;

  await product.save();
  return product;
};

export const deleteProductReview = async (productId, userId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw ApiError.notFound("Product not found");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound("Product not found");
  }

  const reviewIndex = product.reviews.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  if (reviewIndex === -1) {
    throw ApiError.notFound("You have not reviewed this product yet");
  }

  // Remove the review
  product.reviews.splice(reviewIndex, 1);
  product.numReviews = product.reviews.length;

  if (product.numReviews === 0) {
    product.rating = 0;
  } else {
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Math.round((totalRating / product.numReviews) * 10) / 10;
  }

  await product.save();
  return product;
};
