import mongoose from "mongoose";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { USER_ROLES } from "../constants.js";

/**
 * user.service.js
 *
 * User management operations for Admins.
 * Rules: Never touches req / res (Rule 3).
 */

/**
 * Helper to escape special characters for safe regular expression queries.
 * Prevents ReDoS and regex injection attacks.
 */
const escapeRegex = (string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Get paginated list of registered users (excluding sensitive hashes).
 * Supports safe search on name/email, role filtering, and bounded pagination.
 *
 * @param {Object} query - { page, limit, search, role }
 * @returns {Promise<{ users: Array, pagination: Object }>}
 */
export const getAllUsers = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(query.limit, 10) || 10), 50);
  const skip = (page - 1) * limit;

  const filter = {};

  // 1. Safe regex search across name and email
  if (typeof query.search === "string" && query.search.trim()) {
    const escaped = escapeRegex(query.search.trim());
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  // 2. Role whitelist filter
  if (query.role !== undefined && query.role !== null && query.role !== "") {
    if (typeof query.role !== "string") {
      throw ApiError.badRequest("Role filter must be a string");
    }
    const roleLower = query.role.trim().toLowerCase();
    const validRoles = Object.values(USER_ROLES);
    if (!validRoles.includes(roleLower)) {
      throw ApiError.badRequest(
        `Invalid role filter. Allowed values: ${validRoles.join(", ")}`
      );
    }
    filter.role = roleLower;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password -refreshTokenHash -passwordResetTokenHash -passwordResetExpires -__v")
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete a user account with strict safety checks:
 *   1. An admin cannot delete their own account.
 *   2. The last admin in the system cannot be deleted.
 *
 * @param {string} targetUserId - ID of the user to delete
 * @param {string} currentAdminId - ID of the admin making the request
 * @returns {Promise<{ message: string }>}
 */
export const deleteUser = async (targetUserId, currentAdminId) => {
  if (!mongoose.isValidObjectId(targetUserId)) {
    throw ApiError.notFound("User not found");
  }

  // Guard 1: Admin cannot delete themselves
  if (String(targetUserId) === String(currentAdminId)) {
    throw ApiError.badRequest("You cannot delete your own admin account");
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Guard 2: If target is admin, ensure it is not the last remaining admin
  if (user.role === USER_ROLES.ADMIN) {
    const adminCount = await User.countDocuments({ role: USER_ROLES.ADMIN });
    if (adminCount <= 1) {
      throw ApiError.badRequest(
        "Cannot delete the last admin account. The system must retain at least one administrator."
      );
    }
  }

  await User.findByIdAndDelete(targetUserId);

  return { message: "User deleted successfully" };
};
