import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Bot,
  X,
  Send,
  RotateCcw,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { aiApi } from "../../../api/ai.api.js";
import { useAuth } from "../../../hooks/useAuth.js";
import AIProductCard from "./AIProductCard.jsx";

const SUGGESTED_PROMPTS = [
  "👟 Suggest running shoes under ₹3000",
  "🚚 What are store delivery & return policies?",
  "⭐ Which electronics have the best ratings?",
  "🎁 Recommend popular gift items",
];

const MAX_MESSAGE_LENGTH = 500;

/**
 * Safely renders markdown bold (**text**) and bullet lists (* item)
 * without using dangerouslySetInnerHTML, keeping it 100% XSS-safe.
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-1" />;

        const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ");
        const content = isBullet ? trimmed.slice(2) : line;

        // Parse **bold** parts safely
        const parts = content.split(/(\*\*[^*]+\*\*)/g);

        const renderedContent = parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partIdx} className="font-semibold text-gray-950">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={partIdx}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-amber-600 font-bold leading-tight select-none">•</span>
              <div className="flex-1 leading-relaxed">{renderedContent}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="leading-relaxed">
            {renderedContent}
          </p>
        );
      })}
    </div>
  );
}

/**
 * AIChatbot.jsx
 *
 * Floating AI Shopping Assistant for ShopEase storefront.
 * Adheres to all Mandatory Security & Privacy Requirements:
 *   - Zero client-side API key exposure (Security Requirement 1)
 *   - Grounded catalog recommendations (Security Requirement 2 & 8)
 *   - Input bounds (max 500 characters) enforced on client and server (Security Requirement 4)
 *   - Rate limiting awareness and graceful error banners (Security Requirement 4)
 */
export default function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial welcome message
  const getInitialMessage = () => ({
    id: "welcome-msg",
    role: "assistant",
    text: user?.name
      ? `Hello ${user.name}! 👋 I am your ShopEase Shopping Assistant. Looking for specific products, budget deals, or store policy details?`
      : "Hello! 👋 I am your ShopEase Shopping Assistant. Ask me to find products, compare prices, or answer store shopping queries!",
    recommendedProducts: [],
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState([getInitialMessage()]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isLoading]);

  // Handle clearing conversation
  const handleClearHistory = () => {
    setMessages([getInitialMessage()]);
    setError(null);
  };

  // Submit chat query to backend
  const handleSendMessage = async (textToSend) => {
    const rawText = (textToSend ?? inputMessage).trim();
    if (!rawText || isLoading) return;

    if (rawText.length > MAX_MESSAGE_LENGTH) {
      setError(`Message exceeds limit of ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    setError(null);
    setInputMessage("");

    // Append user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: rawText,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build lightweight conversation history for multi-turn context (last 4 turns)
      const historyPayload = newMessages
        .slice(-5, -1) // Exclude current message and keep max 4 previous turns
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          text: m.text,
        }));

      const data = await aiApi.chat({
        message: rawText,
        history: historyPayload,
      });

      // Append assistant response with trusted product cards
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: data?.reply || "I'm here to help you shop! What are you looking for?",
        recommendedProducts: data?.recommendedProducts || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const status = err.response?.status;
      const apiErrMsg = err.response?.data?.message;

      if (status === 429) {
        setError(
          apiErrMsg ||
            "Query limit reached. Please wait a few moments before sending more messages."
        );
      } else if (status === 503) {
        setError(
          apiErrMsg ||
            "AI Shopping Assistant is currently unavailable. Please browse products directly."
        );
      } else {
        setError(
          apiErrMsg || "Unable to reach ShopEase Assistant. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* --------------------------------------------------------------------- */}
      {/* 1. FLOATING LAUNCHER BUTTON                                           */}
      {/* --------------------------------------------------------------------- */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open ShopEase AI Shopping Assistant"
            className="group relative flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-full shadow-lg shadow-amber-600/30 hover:shadow-xl hover:shadow-amber-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-300/50"
          >
            {/* Subtle pulsing background glow */}
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 opacity-60 blur-xs group-hover:opacity-100 transition duration-300 animate-pulse" />

            <div className="relative flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-wide">ShopEase AI</span>
            </div>
          </button>
        )}
      </div>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-2xs z-40 sm:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2. CHAT DRAWER / WINDOW                                               */}
      {/* --------------------------------------------------------------------- */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="ShopEase AI Assistant Chat"
          className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 w-auto sm:w-[410px] h-[580px] max-h-[88vh] sm:max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-gray-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-between shadow-xs flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-amber-600 rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">ShopEase Assistant</h3>
                <p className="text-[11px] text-amber-100/90 font-medium">
                  Live Catalog Advisor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Clear conversation"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Clear chat history"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Bubble */}
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-tr-xs shadow-xs"
                      : "bg-white text-gray-800 rounded-tl-xs border border-gray-200/70 shadow-xs"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <FormattedMessage text={msg.text} />
                  )}
                </div>

                {/* Attached Recommended Product Cards */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-2.5 w-full max-w-[95%] space-y-2">
                    <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                      <span>Recommended In-Stock ({msg.recommendedProducts.length})</span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.recommendedProducts.map((product) => (
                        <AIProductCard
                          key={product._id}
                          product={product}
                          onSelect={() => {
                            // Keep chat available while viewing item
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-xs py-1">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1 px-3 py-2 bg-white rounded-2xl rounded-tl-xs border border-gray-200/80 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            {/* Error Message Banner */}
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips (Available throughout conversation) */}
          {!isLoading && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt.replace(/^[^\w\s]+\s*/, ""))}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-medium border border-amber-200/70 transition-colors shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input & Action Bar */}
          <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about products, sizes, prices, returns..."
                  rows={1}
                  maxLength={MAX_MESSAGE_LENGTH}
                  disabled={isLoading}
                  className="w-full resize-none py-2 pl-3 pr-8 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all disabled:bg-gray-50 disabled:opacity-60 max-h-24"
                />

                {/* Character Count Warning (visible when length > 350) */}
                {inputMessage.length > 350 && (
                  <span
                    className={`absolute right-2.5 bottom-2 text-[10px] font-medium ${
                      inputMessage.length >= MAX_MESSAGE_LENGTH
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {inputMessage.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
                className="h-9 w-9 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-95 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-1.5 text-center">
              <span className="text-[10px] text-gray-400 font-medium">
                Grounded in ShopEase live catalog. Never shares personal data.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
