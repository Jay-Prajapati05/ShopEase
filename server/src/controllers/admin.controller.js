import * as adminService from "../services/admin.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * admin.controller.js
 *
 * Thin controller adapter for admin dashboard metrics.
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getAdminStats();
  res
    .status(200)
    .json(new ApiResponse(200, "Admin stats fetched successfully", stats));
});
