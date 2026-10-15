import * as userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * user.controller.js
 *
 * Thin adapter between HTTP requests and user.service.js.
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully", result));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, result.message));
});
