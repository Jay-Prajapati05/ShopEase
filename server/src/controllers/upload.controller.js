import * as uploadService from "../services/upload.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

/**
 * upload.controller.js
 *
 * Thin adapter between HTTP multipart upload and upload.service.js.
 */
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.buffer) {
    throw ApiError.badRequest("Please select an image file to upload");
  }

  const result = await uploadService.uploadImage(req.file.buffer);

  res
    .status(200)
    .json(new ApiResponse(200, "Image uploaded successfully", result));
});

export default { uploadImage };
