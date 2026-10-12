import * as productService from "../services/product.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getProducts = asyncHandler(async (req, res) => {
  const { products, pagination } = await productService.getProducts(req.query);

  res
    .status(200)
    .json(new ApiResponse(200, "Products fetched", { products, pagination }));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getCategories();

  res
    .status(200)
    .json(new ApiResponse(200, "Categories fetched", { categories }));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(200).json(new ApiResponse(200, "Product fetched", { product }));
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);

  res.status(201).json(new ApiResponse(201, "Product created", { product }));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  res.status(200).json(new ApiResponse(200, "Product updated", { product }));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  res.status(200).json(new ApiResponse(200, "Product deleted"));
});
