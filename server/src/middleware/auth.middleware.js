import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/tokens.js";
import { ACCESS_TOKEN_COOKIE } from "../constants.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (!token) throw ApiError.unauthorized("Not logged in");

  const decoded = verifyAccessToken(token);

  // Load fresh user from DB, so role changes and deleted users take effect immediately
  const user = await User.findById(decoded.sub);
  if (!user) throw ApiError.unauthorized("User no longer exists");

  req.user = user;
  next();
});

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to do this"));
    }
    next();
  };