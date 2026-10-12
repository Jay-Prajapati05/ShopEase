import * as authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies.js";
import { REFRESH_TOKEN_COOKIE } from "../constants.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body ?? {};

  const { user, tokens } = await authService.register({ name, email, password });
  setAuthCookies(res, tokens);

  res.status(201).json(new ApiResponse(201, "Registered successfully", { user }));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {};

  const { user, tokens } = await authService.login({ email, password });
  setAuthCookies(res, tokens);

  res.status(200).json(new ApiResponse(200, "Logged in successfully", { user }));
});

export const refresh = asyncHandler(async (req, res) => {
  try {
    const { user, tokens } = await authService.refresh(
      req.cookies?.[REFRESH_TOKEN_COOKIE]
    );
    setAuthCookies(res, tokens);

    res.status(200).json(new ApiResponse(200, "Token refreshed", { user }));
  } catch (error) {
    // Bad or reused token: remove cookies so the browser stops sending them
    clearAuthCookies(res);
    throw error;
  }
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[REFRESH_TOKEN_COOKIE]);
  clearAuthCookies(res);

  res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);

  res.status(200).json(new ApiResponse(200, "User fetched", { user }));
});