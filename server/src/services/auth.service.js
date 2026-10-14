import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import sendEmail from "../utils/sendEmail.js";
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

export const forgotPassword = async (email) => {
  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    throw ApiError.badRequest("A valid email address is required");
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  // Security spec: Generic response whether or not the email exists (prevents account enumeration)
  const genericResponse = {
    message: "If an account with that email exists, a password reset link has been sent.",
  };

  if (!user) {
    return genericResponse;
  }

  // Generate 32-byte secure random hex token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token using SHA-256 for secure storage in database
  const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Token expires in 15 minutes (Roadmap spec)
  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // Construct client reset URL
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const messageText = `You requested a password reset for your ShopEase account.\n\nPlease click the following link to reset your password (valid for 15 minutes):\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

  const messageHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #4f46e5; margin-bottom: 16px;">ShopEase Password Reset</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        You requested to reset the password for your ShopEase account. Click the button below to set a new password:
      </p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
        This link is single-use and will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">
        Or copy and paste this link into your browser:<br />
        <a href="${resetUrl}" style="color: #4f46e5; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: "ShopEase Password Reset Request",
      text: messageText,
      html: messageHtml,
    });
  } catch (err) {
    // Roll back reset tokens if email sending fails
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw ApiError.internal("Failed to dispatch password reset email. Please try again.");
  }

  return genericResponse;
};

export const resetPassword = async (token, newPassword) => {
  if (typeof token !== "string" || !token.trim()) {
    throw ApiError.badRequest("Password reset token is required");
  }

  if (
    typeof newPassword !== "string" ||
    newPassword.length < 8 ||
    newPassword.length > 72
  ) {
    throw ApiError.badRequest("Password must be between 8 and 72 characters");
  }

  // Hash incoming raw token to compare against stored hash
  const tokenHash = crypto
    .createHash("sha256")
    .update(token.trim())
    .digest("hex");

  // Query user where token matches and has not expired
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetTokenHash +passwordResetExpires +refreshTokenHash");

  if (!user) {
    throw ApiError.badRequest("Password reset token is invalid or has expired");
  }

  // Set new password (pre("save") hook will bcrypt hash it)
  user.password = newPassword;

  // Clear single-use reset fields
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;

  // Spec requirement: clear refreshTokenHash so all existing sessions end across all devices
  user.refreshTokenHash = undefined;

  await user.save();

  return {
    message: "Password reset successfully. Please log in with your new password.",
  };
};