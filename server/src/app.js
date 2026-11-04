import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sanitizeNoSql } from "./middleware/sanitize.middleware.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

const app = express();

// Trust reverse proxy in production (Render, AWS, Nginx) for secure cookies & correct client IP
app.set("trust proxy", 1);

// HTTP Security Headers (CSP disabled for CDN assets, COOP set to same-origin-allow-popups for Razorpay 3D Secure / Netbanking frames)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: false,
  })
);

const clientUrl = process.env.CLIENT_URL?.replace(/\/$/, "");
const adminClientUrl = process.env.ADMIN_CLIENT_URL?.replace(/\/$/, "");

const staticAllowedOrigins = [
  clientUrl,
  adminClientUrl,
  "https://shop-ease-orpin-alpha.vercel.app",
  "http://localhost:5173",
  "http://localhost:8000",
  "http://admin.localhost:5173",
  "http://admin.localhost:8000",
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (staticAllowedOrigins.includes(origin)) return true;

  // Allow any *.localhost on local dev ports 5173 / 8000
  if (/^http:\/\/[a-z0-9-]+\.localhost:(5173|8000)$/.test(origin)) {
    return true;
  }

  // Allow subdomains of COOKIE_DOMAIN if set (e.g. '.shopease.com')
  const cookieDomain = process.env.COOKIE_DOMAIN?.replace(/^\./, "");
  if (cookieDomain) {
    try {
      const url = new URL(origin);
      if (
        url.hostname === cookieDomain ||
        url.hostname.endsWith(`.${cookieDomain}`)
      ) {
        return true;
      }
    } catch {
      // Ignore URL parsing errors and reject
    }
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(sanitizeNoSql);

// General rate limiter across all /api routes
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);

// Serve static client build (Single-Origin SPA)
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback: any non-API GET request serves React index.html (Express 5 named splat)
  app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Must stay last
app.use(notFound);
app.use(errorHandler);

export {app};