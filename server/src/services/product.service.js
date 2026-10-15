import mongoose from "mongoose";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import pick from "../utils/pick.js";
import escapeRegex from "../utils/escapeRegex.js";
import { deleteImages } from "./upload.service.js";

const WRITABLE_FIELDS = [
  "name",
  "description",
  "price",
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
  if (category) filter.category = category;

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
