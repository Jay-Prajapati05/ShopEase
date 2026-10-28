/**
 * ai-security.test.js
 *
 * Automated Security & Regression Test Suite for ShopEase AI Shopping Assistant.
 * Validates adherence to the 10 Mandatory Security & Privacy Requirements:
 *   1. Strict input bounding & sanitization (message <= 500 chars, history <= 10 turns).
 *   2. Sensitive output inspection scanner (isOutputSafe regex tests).
 *   3. Catalog grounding & trusted product card resolution (resolveRecommendedProducts).
 *   4. Safe system instruction construction (buildSystemInstruction).
 *   5. Live endpoint integration validation (against http://localhost:8000/api/ai/chat).
 *
 * Execution: node server/tests/ai-security.test.js
 */

import assert from "node:assert/strict";
import {
  isOutputSafe,
  resolveRecommendedProducts,
  buildSystemInstruction,
} from "../src/services/ai.service.js";

const BASE_URL = process.env.TEST_API_URL || "http://localhost:8000";

let passedCount = 0;
let failedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failedCount++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failedCount++;
  }
}

console.log("\n=======================================================");
console.log("  ShopEase AI Assistant — Security & Regression Tests  ");
console.log("=======================================================\n");

// ---------------------------------------------------------------------------
// SUITE 1: Sensitive Output Inspection Scanner (Security Requirement 5)
// ---------------------------------------------------------------------------
console.log("--- Suite 1: Sensitive Output Scanner (isOutputSafe) ---");

runTest("detects and blocks Google API keys", () => {
  const leaked = "Here is your key: AIzaSyD3xAmP1eK3yEx4mp1eK3yEx4mp1e1234";
  assert.equal(isOutputSafe(leaked), false);
});

runTest("detects and blocks generic/OpenAI API keys", () => {
  const leaked = "Secret: sk-abcdefghijklmnopqrstuvwxyz123456";
  assert.equal(isOutputSafe(leaked), false);
});

runTest("detects and blocks Bearer authorization headers", () => {
  const leaked = "Use Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
  assert.equal(isOutputSafe(leaked), false);
});

runTest("detects and blocks raw JWT tokens", () => {
  const leaked = "Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doz";
  assert.equal(isOutputSafe(leaked), false);
});

runTest("detects and blocks private customer email addresses", () => {
  const leaked = "Contact our user directly at customer.vip@example.com for discounts";
  assert.equal(isOutputSafe(leaked), false);
});

runTest("detects and blocks Indian mobile numbers", () => {
  const leakedWithCountryCode = "Call customer care at +919876543210 for help";
  const leakedStandard = "Reach our support line on 9876543210 immediately";
  assert.equal(isOutputSafe(leakedWithCountryCode), false);
  assert.equal(isOutputSafe(leakedStandard), false);
});

runTest("detects and blocks database connection strings / credentials", () => {
  const dbUri = "Database: mongodb+srv://admin:pass@cluster.mongodb.net/shopease";
  const passwordLeak = "The internal password is password=SuperSecretKey123";
  assert.equal(isOutputSafe(dbUri), false);
  assert.equal(isOutputSafe(passwordLeak), false);
});

runTest("allows clean and safe shopping recommendations", () => {
  const safeReply =
    "We recommend the Nike Air Zoom (₹2,999) and Puma Running Shoes (₹2,199). Both are in stock with free delivery on orders above ₹500.";
  assert.equal(isOutputSafe(safeReply), true);
});

runTest("rejects non-string or empty input safely", () => {
  assert.equal(isOutputSafe(null), false);
  assert.equal(isOutputSafe(undefined), false);
  assert.equal(isOutputSafe(12345), false);
  assert.equal(isOutputSafe(""), false);
});

// ---------------------------------------------------------------------------
// SUITE 2: Catalog Grounding & Product Card Resolution (Security Requirement 8)
// ---------------------------------------------------------------------------
console.log("\n--- Suite 2: Catalog Grounding & Trusted Cards (resolveRecommendedProducts) ---");

const mockCatalog = [
  {
    _id: "65a111111111111111111111",
    name: "Running Shoes Pro",
    price: 2499,
    countInStock: 8,
    rating: 4.6,
    category: "Shoes",
    images: [{ url: "https://example.com/shoes.jpg" }],
  },
  {
    _id: "65a222222222222222222222",
    name: "Out of Stock Winter Jacket",
    price: 4999,
    countInStock: 0, // OUT OF STOCK
    rating: 4.8,
    category: "Clothing",
    images: [{ url: "https://example.com/jacket.jpg" }],
  },
  {
    _id: "65a333333333333333333333",
    name: "Wireless Earbuds",
    price: 1999,
    countInStock: 15,
    rating: 4.3,
    category: "Electronics",
    images: [{ url: "https://example.com/earbuds.jpg" }],
  },
];

runTest("resolves only valid, in-stock products into trusted cards", () => {
  const rawText =
    "I recommend the Running Shoes [PRODUCT: 65a111111111111111111111] and the Earbuds [PRODUCT: 65a333333333333333333333].";
  const { cleanReply, recommendedProducts } = resolveRecommendedProducts(rawText, mockCatalog);

  assert.equal(recommendedProducts.length, 2);
  assert.equal(recommendedProducts[0]._id, "65a111111111111111111111");
  assert.equal(recommendedProducts[0].name, "Running Shoes Pro");
  assert.equal(recommendedProducts[0].price, 2499);
  assert.equal(recommendedProducts[0].image, "https://example.com/shoes.jpg");
  assert.equal(recommendedProducts[1]._id, "65a333333333333333333333");

  // Brackets must be stripped cleanly from cleanReply
  assert.ok(!cleanReply.includes("[PRODUCT:"));
  assert.ok(cleanReply.includes("Running Shoes"));
  assert.ok(cleanReply.includes("Earbuds"));
});

runTest("discards out-of-stock products even if model hallucinates or recommends them", () => {
  const rawText =
    "You might also like this jacket [PRODUCT: 65a222222222222222222222] for winter.";
  const { recommendedProducts } = resolveRecommendedProducts(rawText, mockCatalog);

  assert.equal(recommendedProducts.length, 0, "Out-of-stock items must never be returned as product cards");
});

runTest("discards fake or fabricated product IDs", () => {
  const rawText =
    "Check out this amazing nonexistent item [PRODUCT: 65afffffffffffffffffffff]!";
  const { recommendedProducts } = resolveRecommendedProducts(rawText, mockCatalog);

  assert.equal(recommendedProducts.length, 0, "Nonexistent product IDs must be safely discarded");
});

// ---------------------------------------------------------------------------
// SUITE 3: Server-Controlled System Instruction Construction
// ---------------------------------------------------------------------------
console.log("\n--- Suite 3: System Instruction Construction (buildSystemInstruction) ---");

runTest("injects only allowlisted catalog fields and store policies", () => {
  const instruction = buildSystemInstruction(mockCatalog, null);

  assert.ok(instruction.includes("Running Shoes Pro"));
  assert.ok(instruction.includes("₹2499"));
  assert.ok(instruction.includes("Cash on Delivery (COD)"));
  assert.ok(instruction.includes("Razorpay"));
  assert.ok(instruction.includes("The customer is currently browsing as a guest."));
  assert.ok(instruction.includes("MANDATORY SECURITY & PRIVACY RULES:"));
});

runTest("personalizes greeting for authenticated customer without exposing private data", () => {
  const authUser = { _id: "65a999999999999999999999", name: "Aarav Sharma" };
  const instruction = buildSystemInstruction(mockCatalog, authUser);

  assert.ok(instruction.includes('The customer is currently logged in as "Aarav Sharma".'));
  // Ensure sensitive user properties like hash, token, or email are never part of system instructions
  assert.ok(!instruction.includes("password"));
  assert.ok(!instruction.includes("email"));
});

// ---------------------------------------------------------------------------
// SUITE 4: Live HTTP Boundary & Validation Tests
// ---------------------------------------------------------------------------
console.log("\n--- Suite 4: Live HTTP API Boundary & Validation Tests ---");

async function runHttpTests() {
  // Check if local server is reachable
  let isServerRunning = false;
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    if (healthRes.ok) isServerRunning = true;
  } catch {
    isServerRunning = false;
  }

  if (!isServerRunning) {
    console.log(`  ⚠ NOTICE: Server at ${BASE_URL} is not responding. Skipping live HTTP tests.`);
    console.log(`    (Start the server with 'npm run dev' to run live HTTP assertions).`);
    return;
  }

  await runAsyncTest("rejects empty message with 400 Bad Request", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.success, false);
    assert.ok(body.message.includes("Message is required"));
  });

  await runAsyncTest("rejects whitespace-only message with 400 Bad Request", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "    " }),
    });
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.success, false);
  });

  await runAsyncTest("rejects non-string message with 400 Bad Request", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: 12345 }),
    });
    assert.equal(res.status, 400);
  });

  await runAsyncTest("rejects message exceeding 500 characters with 400 Bad Request", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "a".repeat(501) }),
    });
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.ok(body.message.includes("exceeds maximum allowed length"));
  });

  await runAsyncTest("rejects history exceeding 10 items with 400 Bad Request", async () => {
    const oversizedHistory = Array.from({ length: 11 }, (_, i) => ({
      role: "user",
      text: `Question ${i + 1}`,
    }));
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Tell me more",
        history: oversizedHistory,
      }),
    });
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.ok(body.message.includes("exceeds maximum of 10"));
  });

  await runAsyncTest("processes valid shopping question with 200 OK", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Can you recommend running shoes?",
      }),
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.ok(body.data?.reply, "Response must include reply text");
    assert.ok(Array.isArray(body.data?.recommendedProducts), "Response must include recommendedProducts array");
  });
}

// ---------------------------------------------------------------------------
// Run Test Suite
// ---------------------------------------------------------------------------
runHttpTests().then(() => {
  console.log("\n=======================================================");
  console.log(`  Tests Completed: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
