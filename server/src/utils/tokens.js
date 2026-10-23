import jwt from "jsonwebtoken";
import crypto from "crypto";
import ApiError from "./ApiError.js";

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET || process.env.ACCESS_TOKEN_SECRET;

const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

export const generateAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, getAccessSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

export const generateRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, getRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRY,
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
  verifyToken(token, getAccessSecret());

export const verifyRefreshToken = (token) =>
  verifyToken(token, getRefreshSecret());

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");