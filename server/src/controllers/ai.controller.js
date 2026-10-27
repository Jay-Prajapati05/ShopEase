import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import aiService from "../services/ai.service.js";

/**
 * ai.controller.js
 *
 * HTTP Controller for the ShopEase AI Shopping Assistant.
 * Rules: Contains no business logic; services never touch req or res (Rule 3).
 */

/**
 * POST /api/ai/chat
 *
 * Validates incoming chat message and invokes aiService.
 * Enforces strict input validation and limits (Security Requirement 4):
 *   - message: required non-empty string, max 500 characters
 *   - history: optional array, max 10 previous turns
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const handleChat = asyncHandler(async (req, res) => {
  const { message, history } = req.body ?? {};

  // 1. Validate 'message' input (Security Requirement 4)
  if (!message || typeof message !== "string" || !message.trim()) {
    throw ApiError.badRequest("Message is required and must be a non-empty string");
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 500) {
    throw ApiError.badRequest("Message exceeds maximum allowed length of 500 characters");
  }

  // 2. Validate conversation 'history' payload if provided
  let validHistory = [];
  if (history !== undefined && history !== null) {
    if (!Array.isArray(history)) {
      throw ApiError.badRequest("History must be an array of previous messages");
    }
    if (history.length > 10) {
      throw ApiError.badRequest("Conversation history exceeds maximum of 10 messages");
    }

    // Ensure each history item has expected string shape
    for (const item of history) {
      if (!item || typeof item !== "object") {
        throw ApiError.badRequest("Each history entry must be an object with role and text");
      }
      const itemText = item.text || item.message || "";
      if (typeof itemText !== "string" || itemText.length > 500) {
        throw ApiError.badRequest("History item text must not exceed 500 characters");
      }
    }

    validHistory = history;
  }

  // 3. Invoke Service Layer (Req 6: user attached via optionalAuth if logged in)
  const result = await aiService.chatWithAssistant({
    message: trimmedMessage,
    history: validHistory,
    user: req.user || null,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "AI response generated successfully", result));
});

export default { handleChat };
