# ShopEase 🛍️

A modern, production-grade full-stack e-commerce platform built with the **MERN Stack** (MongoDB, Express.js 5, React 18, Node.js) and Tailwind CSS.

Designed with an enterprise-level architecture: strict separation of concerns, zero-trust server-side monetary calculations, rotating HTTP-only JWT authentication, multi-tier rate limiting, atomic inventory management, Cloudinary media processing, and Razorpay online payments.

---

## 🌟 Overview & System Highlights

ShopEase covers the complete end-to-end e-commerce lifecycle for both customers and store administrators:

- **Customer Journey:** Live debounced search & category discovery ➔ Persistent cart ➔ Zero-trust checkout (Cash on Delivery or Razorpay) ➔ Instant cryptographic payment verification ➔ Visual order tracking stepper ➔ Product reviews with verified buyer badges ➔ Customer profile management.
- **Administrator Hub:** Real-time analytics dashboard with MongoDB aggregation ➔ Full catalog inventory management with Cloudinary drag-and-drop uploads ➔ Order fulfillment pipeline with state-machine status transitions ➔ Customer user directory with account protection guards.
- **Production Hardened:** Reverse proxy trust configuration (`trust proxy`), HTTP security headers (`helmet`), two-tier rate limiting (`express-rate-limit`), Express 5 NoSQL operator sanitization, and Vercel Single-Page Application (SPA) routing fallback.

---

## 🏗️ Architecture & Engineering Principles

### Backend Layering (Strict Separation of Concerns)

```text
HTTP Request
     │
     ▼
[ Reverse Proxy Trust & Helmet Security Headers ]
     │
     ▼
[ Rate Limiting & NoSQL Sanitization ]
     │
     ▼
[ Express Router ] ── (Routes /api/...)
     │
     ▼
[ Controller Layer ] ── (Thin HTTP adapters; req/res handling; input picking)
     │
     ▼
[ Service Layer ] ── (Pure business logic; zero req/res access; reusable)
     │
     ▼
[ Mongoose Model ] ── (Data validation; indexing; schema definitions)
     │
     ▼
[ MongoDB Atlas ]
```

1. **Services Never Touch `req` or `res`:** All business logic lives in `src/services/`. Controllers only parse incoming requests and format responses using standardized `ApiResponse` and `ApiError` utilities.
2. **Never Trust the Client (Rule 8):** Cart prices and client-submitted totals are strictly ignored. The server re-queries every product from the database, checks live stock, and recalculates line items, 5% GST tax, and shipping fees.
3. **Atomic Stock Decrements:** Uses MongoDB's atomic `findOneAndUpdate({ _id, countInStock: { $gte: qty } }, { $inc: { countInStock: -qty } })` with automated compensation rollback on race conditions.
4. **Immutable Order Snapshots:** At purchase time, product details (`name`, `price`, `image`) are snapshotted into the order record, ensuring historical order integrity even if the catalog is modified or deleted later.
5. **Fail-Fast Environment Validation:** Startup scripts validate required environment variables before attempting database connections or opening network ports.

---

## 🛡️ Security Hardening & Defenses (Phase 10)

| Security Domain | Defense Mechanism | Implementation Details |
|---|---|---|
| **Token Storage** | `httpOnly`, `secure`, `SameSite` Cookies | Access tokens (15m) and refresh tokens (7d) are stored in secure cookies, eliminating client-side XSS token theft. |
| **Session Hijacking** | Refresh Token Rotation & Reuse Detection | Every refresh call atomically issues a new token and revokes the old one. Presenting an old or reused token immediately revokes all active sessions. |
| **Brute Force & DoS** | Two-Tier Rate Limiting | `apiLimiter` (500 req/15m) protects the general API; `authLimiter` (20 req/15m) strictly throttles `/login`, `/register`, and `/forgot-password`. |
| **HTTP Headers** | Helmet Middleware | Sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Cross-Origin-Opener-Policy: same-origin-allow-popups` (allows Razorpay bank popups), and removes `X-Powered-By`. |
| **Reverse Proxy** | `trust proxy: 1` | Correctly resolves client IP addresses behind cloud load balancers (Render, Vercel) and enables secure cookie transport over HTTPS. |
| **NoSQL Injection** | Express 5 Safe Sanitizer | Recursively cleans keys containing `$` or `.` from request bodies and route parameters without mutating read-only `req.query`. |
| **Account Enumeration** | Constant-Time Comparison | Login endpoints run constant-time dummy bcrypt comparisons for non-existent users; forgot password returns uniform success messages. |
| **Payment Tampering** | Cryptographic HMAC-SHA256 Verification | Razorpay payment signatures are validated using Node's `crypto.timingSafeEqual` with buffer length matching to prevent timing attacks. |
| **AI Assistant Guardrails** | Grounded RAG-lite & Output Scanner | In-stock catalog projection (`countInStock > 0`), trusted DB product card mapping, sensitive regex output scanner (API keys, JWTs, PII), prompt injection defenses, and IPv6 rate limiting. |

---

## 🚀 Complete Feature Walkthrough

### 1. Authentication & User Profile
- Dual-token JWT system with automated silent token refresh using a single in-flight promise Axios interceptor.
- Self-service password recovery using high-entropy 32-byte cryptographic hex tokens (`crypto.randomBytes`), stored as SHA-256 hashes with a 15-minute expiry, delivered via Brevo v3 HTTPS REST API (Port 443) with an 8-second timeout guard.
- Protected `/profile` hub allowing customers to update display names, modify email addresses with duplicate validation, and change passwords requiring current password confirmation.

### 2. Product Catalog & Live Discovery
- Server-side paginated catalog with live search (300ms debounce), category pill filtering, price range slider, and stock availability toggles.
- Product details page featuring multi-image carousel galleries, real-time stock counters, and quantity selectors.
- Catalog cards display live aggregate star ratings and total review counts.

### 3. Customer Reviews & Verified Buyer Badges
- 1 to 5 star rating submission with written feedback.
- Strict constraint: 1 review per user per product.
- **Strict Verified Buyer Engine (Option B):** Review submission is restricted strictly to verified purchasers who ordered and received the item (`orderStatus: "Delivered"`). Verified purchasers receive a distinctive green badge with a checkmark, while non-purchasing users see an informational lock notice.
- Dynamic 5-to-1 star percentage breakdown progress bars.
- Inline editing and deletion with automatic atomic recalculation of aggregate rating and review counters.

### 4. Cart, Checkout & Orders
- User-isolated persistent cart synchronized with `localStorage` (`shopease_cart_<userId>`), guest cart merge on login, and instant navbar badge reset to 0 on logout.
- Real-time checkout price breakdown: Subtotal, 5% GST, and Shipping (FREE above ₹500, flat ₹50 otherwise).
- Delivery address form with real-time field validation.
- Visual progress stepper on order detail pages (`Processing` ➔ `Shipped` ➔ `Delivered`).
- Paginated "My Orders" customer portal.

### 5. Online Payments (Razorpay Integration)
- Seamless Razorpay Checkout modal styled to match the warm amber brand theme (`#d97706`).
- Server recomputes total amounts strictly in paise (`Math.round(totalPrice * 100)`).
- Idempotent signature verification preventing duplicate payment records.
- Payment retry mechanism: Unpaid or dismissed payment sessions remain retryable via "Pay Now" triggers on both `MyOrdersPage` and `OrderDetailPage`.

### 6. Admin Control Center & Cloudinary Uploads
- **Executive Analytics:** Real-time aggregation pipelines calculating lifetime revenue, total orders, registered customer volume, and low stock warnings.
- **Catalog Management:** Create, edit, and delete products with drag-and-drop Cloudinary image upload (Multer memory storage, 5MB limit, strict MIME whitelist).
- **Automated Asset Cleanup:** Deleting a product or replacing an image automatically calls Cloudinary's destruction API to remove orphaned assets.
- **Order Pipeline:** Visual order counters with status transition controls (`Processing` ➔ `Shipped` ➔ `Delivered` / `Cancelled`). Cancelling an order automatically restores inventory.
- **User Directory:** Paginated user administration with role badges and protection against administrator self-deletion or last-admin lockout.
- **Sticky Viewport Layout:** Viewport-constrained sidebar (`h-screen max-h-screen md:sticky md:top-0`) with global breadcrumbs and "Back to Store" navigation bar.

### 7. Google Gemini AI Shopping Assistant (RAG-lite)
- **Floating Interactive Assistant:** Accessible across all storefront routes via a floating launcher button (`fixed bottom-6 right-6`) with mobile-responsive bottom-anchored drawer, backdrop dismiss, and persistent suggestion chips.
- **Zero Frontend Secret Exposure:** The `GEMINI_API_KEY` lives strictly on the server. Frontend makes authenticated requests to relative `/api/ai/chat`.
- **Grounded Catalog Recommendations:** Server projects live in-stock products into the system instruction. The model emits `[PRODUCT: <id>]` tags which backend verifies against database records to attach trusted product mini-cards (image, title, price, star rating, direct link).
- **Sensitive Output Scanner (`isOutputSafe`):** Regular expressions inspect AI text for API keys, Bearer tokens, JWTs, emails, Indian phone numbers, or database credentials before returning responses.
- **Dual-Tier IPv6 Rate Limiting:** 20 queries / 10m for guest visitors, 40 queries / 10m for authenticated customers, protected against IPv6 subnet rotation using `ipKeyGenerator`.
- **Automated Security Test Suite:** 20 programmatic security regression tests (`node server/tests/ai-security.test.js`) verifying prompt injection defense, input bounds, output safety, and trusted card resolution.

---

## 🛠️ Tech Stack & Dependencies

| Category | Technologies |
|---|---|
| **Backend Runtime** | Node.js (ES Modules), Express.js 5 |
| **Database & ODM** | MongoDB Atlas, Mongoose 9 |
| **Authentication & Crypto** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Node.js `crypto` |
| **Security & Hardening** | `helmet`, `express-rate-limit`, `cookie-parser`, `cors` |
| **File Processing & Media** | Cloudinary v2 SDK, Multer |
| **Payment Gateway** | Razorpay Node SDK |
| **AI Engine & SDK** | Google Gemini 1.5/Flash-Lite API (`@google/generative-ai`) with dynamic model discovery |
| **Email Service** | Brevo v3 HTTPS REST API (Production), `nodemailer` (SMTP) & console fallback (Dev) |
| **Frontend Framework** | React 18, Vite 5, React Router 6 |
| **Styling & Icons** | Tailwind CSS, Lucide React |
| **HTTP Client** | Axios (with credentials and silent refresh interceptor) |

---

## 📂 Project Structure

```text
ShopEase/
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios API services (auth, product, order, payment)
│   │   ├── components/
│   │   │   ├── admin/          # AdminLayout, AdminRoute, Dashboard stats
│   │   │   ├── common/         # Rating, Loader, Modal, Button
│   │   │   ├── features/       # ProductCard, OrderSummary, ReviewCard
│   │   │   └── layout/         # Navbar, Footer, MobileDrawer
│   │   ├── context/            # Global React Contexts (AuthContext, CartContext)
│   │   ├── hooks/              # Custom hooks (useAuth, useCart)
│   │   ├── pages/              # Routed pages (Home, Products, Checkout, Orders, Profile, Admin)
│   │   ├── routes/             # AppRoutes, PrivateRoute, AdminRoute
│   │   ├── index.css           # Tailwind custom tokens & selection styling
│   │   └── main.jsx            # React root mount
│   ├── vercel.json             # Vercel SPA rewrite configuration
│   └── package.json
│
├── server/                     # Express.js REST API
│   ├── src/
│   │   ├── config/             # DB connection & fail-fast validateEnv
│   │   ├── constants.js        # User roles, cookie names, order rules
│   │   ├── controllers/        # Thin HTTP request/response handlers
│   │   ├── middleware/         # Auth (protect/authorize), helmet, sanitize, rateLimiters
│   │   ├── models/             # Mongoose schemas (User, Product, Order)
│   │   ├── routes/             # Express route declarations
│   │   ├── services/           # Core business logic & database queries
│   │   ├── utils/              # ApiError, ApiResponse, tokens, cookies, sendEmail
│   │   ├── app.js              # Express app initialization & middleware stack
│   │   └── server.js           # Server entry point & startup listener
│   └── package.json
│
├── docs/                       # Comprehensive Architecture & Roadmap documentation
└── README.md
```

---

## 📡 API Endpoints Reference

All API routes are prefixed with `/api`.

### Authentication & Account (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public (Throttled) | Register new customer account & set auth cookies |
| `POST` | `/auth/login` | Public (Throttled) | Authenticate user & set auth cookies |
| `POST` | `/auth/refresh` | Public | Rotate access and refresh tokens |
| `POST` | `/auth/logout` | Public | Invalidate refresh token & clear cookies |
| `GET` | `/auth/me` | Authenticated | Fetch current logged-in user details |
| `PUT` | `/auth/profile` | Authenticated | Update display name, email, or password |
| `POST` | `/auth/forgot-password` | Public (Throttled) | Request password reset token via email |
| `POST` | `/auth/reset-password/:token` | Public (Throttled) | Reset password with token & revoke active sessions |

### Products & Reviews (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/products` | Public | Paginated, filtered, and sorted catalog |
| `GET` | `/products/categories` | Public | Distinct product category list |
| `GET` | `/products/:id` | Public | Detailed product document by ID |
| `POST` | `/products` | Admin | Create product |
| `PUT` | `/products/:id` | Admin | Update product details |
| `DELETE` | `/products/:id` | Admin | Delete product and clean up Cloudinary assets |
| `GET` | `/products/:id/review-status` | Authenticated | Check if user can review, has reviewed, and is verified |
| `POST` | `/products/:id/reviews` | Authenticated | Submit review (1 per user; verified buyer check) |
| `PUT` | `/products/:id/reviews` | Authenticated | Update user's existing review & recompute average |
| `DELETE` | `/products/:id/reviews` | Authenticated | Delete user's review & recompute average |

### Orders & Checkout (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/orders` | Authenticated | Place order (COD or Razorpay; server calculates prices & decrements stock) |
| `GET` | `/orders/my-orders` | Authenticated | Fetch paginated order history for current user |
| `GET` | `/orders/:id` | Owner / Admin | Fetch order details (ownership verified) |
| `GET` | `/orders` | Admin | Fetch paginated system orders |
| `PUT` | `/orders/:id/status` | Admin | Transition status (`Processing` ➔ `Shipped` ➔ `Delivered` / `Cancelled`) |

### Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/payments/create-order` | Authenticated | Create Razorpay order from unpaid DB order |
| `POST` | `/payments/verify` | Authenticated | Verify HMAC-SHA256 signature and mark order paid |

### Media Uploads & Admin (`/api/upload`, `/api/admin`, `/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/upload` | Admin | Upload image to Cloudinary (MemoryStorage, 5MB limit, jpeg/png/webp) |
| `GET` | `/admin/stats` | Admin | Aggregate lifetime revenue, order volume, customers & low stock |
| `GET` | `/users` | Admin | Paginated user management directory |
| `DELETE` | `/users/:id` | Admin | Delete user (guards self-deletion and last admin) |

### AI Shopping Assistant (`/api/ai`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/ai/chat` | Public (`optionalAuth`, `aiLimiter`) | AI shopping queries (1-500 chars message, max 10 turns history). Grounded in live in-stock catalog with trusted product cards. |

---

## ⚙️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection string)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Jay-Prajapati05/ShopEase.git
cd ShopEase
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `server/` (refer to `server/.env.example`):
```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/shopease
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars

# Email Service (Brevo HTTPS REST API is recommended; SMTP or console fallback in dev)
BREVO_API_KEY=xkeysib-your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_verified_brevo_email@gmail.com

# Optional: Email SMTP Configuration (prints reset link to console if omitted in dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="ShopEase <your_email@gmail.com>"

# Cloudinary Media Configuration (Phase 7 - Admin Product Images)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Online Payment Gateway (Phase 8 - Online Payments)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google Gemini AI Shopping Assistant
GEMINI_API_KEY=your_gemini_api_key_here
# Optional: GEMINI_MODEL=gemini-flash-lite-latest (auto-discovered if omitted)
```

Start the backend development server:
```bash
npm run dev
```
Backend runs at `http://localhost:8000`.

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install
```

Create a `.env` file in `client/` (refer to `client/.env.example`):
```env
VITE_API_URL=http://localhost:8000/api
```

Start Vite dev server:
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`.

### 4. Creating an Admin Account
To promote an account to Admin:
1. Register a new user at `http://localhost:5173/register`.
2. Open your MongoDB GUI (MongoDB Compass or Atlas Data Explorer).
3. Find the user record in the `users` collection and update `"role": "admin"`.
4. Log out and log back in. The **Admin** portal link will appear in the navigation bar.

---

## 🚢 Production Deployment

### Option A: Unified Same-Origin Deployment (Recommended ⭐)
Both frontend and backend are hosted within a single Render Web Service, elevating all cookies to **First-Party** and eliminating cross-domain cookie restrictions (Chrome Privacy Sandbox, Safari ITP):

1. Create a **Web Service** on [Render](https://render.com) connected to the `ShopEase` repository.
2. **Root Directory:** *Leave blank / empty* (runs from repository root).
3. **Build Command:**
   ```bash
   cd client && npm install --include=dev && npm run build && cd ../server && npm install
   ```
4. **Start Command:**
   ```bash
   cd server && npm start
   ```
5. **Environment Variables:**
   - `NODE_ENV=production`
   - `CLIENT_URL=https://<your-render-service>.onrender.com`
   - `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`
6. *Architecture:* Express serves static assets from `client/dist` and handles SPA client-side routing via `app.get("/{*splat}")`, while the client automatically targets relative `/api`.

### Option B: Split Deployment (Backend on Render, Frontend on Vercel)
1. **Backend (Render):** Web Service pointing to `server`, build: `npm install`, start: `npm start`, `CLIENT_URL=https://your-frontend.vercel.app`.
2. **Frontend (Vercel):** Project pointing to `client`, preset: `Vite`, build: `npm run build`, `VITE_API_URL=https://your-backend.onrender.com/api`.
3. SPA routing handled by `client/vercel.json`. *Note: Requires custom shared parent domains to prevent modern browser third-party cookie blocking.*

---

## 🗺️ Project Roadmap & Status

| Phase | Milestone | Branch | Status |
|---|---|---|---|
| **Phase 1** | Project Setup & Engineering Guidelines | `main` | ✅ Completed |
| **Phase 1b** | Server Foundation & Health Checks | `chore/server-foundation` | ✅ Completed |
| **Phase 2** | JWT Cookie Authentication & RBAC | `feature/auth` | ✅ Completed |
| **Phase 3** | Products Catalog REST API | `feature/products` | ✅ Completed |
| **Phase 4** | Frontend Base Setup (Tailwind, Router, Axios) | `feature/frontend-base` | ✅ Completed |
| **Phase 5** | Products UI & Persistent Cart | `feature/products-ui-cart` | ✅ Completed |
| **Phase 6** | Orders & Atomic COD Checkout (**MVP**) | `feature/orders` | ✅ Completed |
| **Forgot Pwd** | Cryptographic Token Self-Service Password Recovery | `feature/forgot-password` | ✅ Completed |
| **Phase 7** | Admin Dashboard & Cloudinary Media Upload | `feature/admin-upload` | ✅ Completed |
| **Theme Revamp** | Amber Theme, Mobile Drawer & Skeleton Loaders | `feature/responsive-theme-system` | ✅ Completed |
| **Phase 8** | Razorpay Payments & HMAC-SHA256 Verification | `feature/payments` | ✅ Completed |
| **Phase 9** | Reviews, Ratings & Customer Profile Management | `feature/reviews-profile` | ✅ Completed |
| **Phase 10** | Security Hardening, Rate Limiting & `v1.0` Deploy | `chore/hardening` | ✅ Completed |
| **Post-v1.0** | Cart User Isolation & Strict Verified Buyer Reviews | `fix/cart-and-reviews-policy` | ✅ Completed |
| **Post-v1.0** | Auth Cookie Refresh Guard & 401 Error Propagation | `fix/auth-cookie-refresh-guard` | ✅ Completed |
| **Post-v1.0** | Same-Origin Unified Deployment (Express + React SPA) | `feature/render-same-origin-deploy` | ✅ Completed |
| **Post-v1.0** | Razorpay COOP Popups & Brevo HTTPS Email Delivery | `fix/razorpay-coop-and-email` | ✅ Completed |
| **Post-v1.0** | Saved Address, Phone Verification & Mongoose Modernization | `feature/saved-address-and-phone` | ✅ Completed |

---

## 📄 License
This project is open-source and licensed under the [ISC License](file:///j:/temp/ShopEase/server/package.json).