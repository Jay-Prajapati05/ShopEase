import jwt from "jsonwebtoken";
import crypto from "crypto";
import ApiError from "./ApiError.js";

export const generateAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

export const generateRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    jwtid: crypto.randomUUID(), // makes every token unique
  });

export const generateAuthTokens = (user) => ({
  accessToken: generateAccessToken(user),
  refreshToken: generateRefreshToken(user),
});

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
};

export const verifyAccessToken = (token) =>
  verifyToken(token, process.env.ACCESS_TOKEN_SECRET);

export const verifyRefreshToken = (token) =>
  verifyToken(token, process.env.REFRESH_TOKEN_SECRET);

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");