import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import {
  generateAuthTokens,
  verifyRefreshToken,
  hashToken,
} from "../utils/tokens.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Used to keep login timing the same when the email does not exist
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

const normalizeEmail = (email) => email.trim().toLowerCase();

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const saveRefreshHash = (userId, refreshToken) =>
  User.updateOne({ _id: userId }, { refreshTokenHash: hashToken(refreshToken) });

export const register = async ({ name, email, password }) => {
  const errors = [];
  if (typeof name !== "string" || !name.trim()) {
    errors.push("Name is required");
  }
  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    errors.push("A valid email is required");
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 72) {
    errors.push("Password must be between 8 and 72 characters");
  }
  if (errors.length) throw ApiError.badRequest("Validation failed", errors);

  const normalizedEmail = normalizeEmail(email);

  if (await User.exists({ email: normalizedEmail })) {
    throw ApiError.conflict("Email already registered");
  }

  let user;
  try {
    // Only pick known fields: role can never come from the request
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict("Email already registered");
    }
    throw error;
  }

  const tokens = generateAuthTokens(user);
  await saveRefreshHash(user._id, tokens.refreshToken);

  return { user: sanitizeUser(user), tokens };
};

export const login = async ({ email, password }) => {
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    throw ApiError.badRequest("Email and password are required");
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select(
    "+password"
  );

  // Always run bcrypt, even if the user does not exist
  const isMatch = await bcrypt.compare(
    password,
    user ? user.password : DUMMY_HASH
  );

  if (!user || !isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const tokens = generateAuthTokens(user);
  await saveRefreshHash(user._id, tokens.refreshToken);

  return { user: sanitizeUser(user), tokens };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) throw ApiError.unauthorized("Refresh token missing");

  const decoded = verifyRefreshToken(refreshToken);
  const tokens = generateAuthTokens({ _id: decoded.sub });

  // Atomic rotation: swap the hash only if the presented token is the current one
  const user = await User.findOneAndUpdate(
    { _id: decoded.sub, refreshTokenHash: hashToken(refreshToken) },
    { refreshTokenHash: hashToken(tokens.refreshToken) },
    { new: true }
  );

  if (!user) {
    // Old or already-used token: kill the session
    await User.updateOne(
      { _id: decoded.sub },
      { $unset: { refreshTokenHash: 1 } }
    );
    throw ApiError.unauthorized("Session expired, please log in again");
  }

  return { user: sanitizeUser(user), tokens };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) return;
  try {
    const decoded = verifyRefreshToken(refreshToken);
    await User.updateOne(
      { _id: decoded.sub, refreshTokenHash: hashToken(refreshToken) },
      { $unset: { refreshTokenHash: 1 } }
    );
  } catch {
    // Invalid or expired token: nothing to revoke, logout still succeeds
  }
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return sanitizeUser(user);
};