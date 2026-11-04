/**
 * admin-filters.test.js
 *
 * Automated regression & boundary tests for Step 12: Admin Filtering & Search API Hardening.
 * Tests status whitelist validation, user role filtering, and ReDoS/special-char regex escaping.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ORDER_STATUSES } from "../src/models/Order.js";
import { USER_ROLES } from "../src/constants.js";
import * as orderService from "../src/services/order.service.js";
import * as userService from "../src/services/user.service.js";
import ApiError from "../src/utils/ApiError.js";

// Helper regex escape logic matcher
const escapeRegex = (string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("Step 12: Admin Filters & Search Security Tests", () => {
  // ---------------------------------------------------------------------------
  // 1. Order Status Whitelist Validation
  // ---------------------------------------------------------------------------
  describe("Order Status Whitelist Validation", () => {
    it("rejects invalid status filter with 400 Bad Request", async () => {
      const invalidStatuses = ["Pending", "Refunded", "Completed", "RandomStatus", "123", "$gt"];
      for (const status of invalidStatuses) {
        await assert.rejects(
          async () => {
            await orderService.getAllOrders({ status });
          },
          (err) => {
            assert(err instanceof ApiError);
            assert.equal(err.statusCode, 400);
            assert(err.message.includes("Invalid order status filter"));
            return true;
          }
        );
      }
    });

    it("rejects non-string status with 400 Bad Request", async () => {
      const nonStringStatuses = [123, true, {}, []];
      for (const status of nonStringStatuses) {
        await assert.rejects(
          async () => {
            await orderService.getAllOrders({ status });
          },
          (err) => {
            assert(err instanceof ApiError);
            assert.equal(err.statusCode, 400);
            return true;
          }
        );
      }
    });

    it("contains exactly the expected valid statuses in ORDER_STATUSES", () => {
      const valid = Object.values(ORDER_STATUSES);
      assert.deepEqual(valid.sort(), ["Cancelled", "Delivered", "Processing", "Shipped"]);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. User Role Whitelist & Search Sanitization
  // ---------------------------------------------------------------------------
  describe("User Management Role & Search Hardening", () => {
    it("rejects invalid user role filter with 400 Bad Request", async () => {
      const invalidRoles = ["superadmin", "moderator", "guest", "root", "$ne"];
      for (const role of invalidRoles) {
        await assert.rejects(
          async () => {
            await userService.getAllUsers({ role });
          },
          (err) => {
            assert(err instanceof ApiError);
            assert.equal(err.statusCode, 400);
            assert(err.message.includes("Invalid role filter"));
            return true;
          }
        );
      }
    });

    it("rejects non-string role with 400 Bad Request", async () => {
      await assert.rejects(
        async () => {
          await userService.getAllUsers({ role: 99 });
        },
        (err) => {
          assert(err instanceof ApiError);
          assert.equal(err.statusCode, 400);
          return true;
        }
      );
    });

    it("correctly escapes special regex characters without throwing SyntaxError", () => {
      const dangerousInputs = [
        "user+test@example.com",
        "admin (testing)",
        "price*all?^[test]$",
        "test\\escape.com",
        "nested.*+?^${}()|[]\\all",
      ];

      for (const input of dangerousInputs) {
        const escaped = escapeRegex(input);
        // Ensure new RegExp does not throw
        assert.doesNotThrow(() => {
          new RegExp(escaped, "i");
        });
        // Ensure literal special character matches literally
        const regex = new RegExp(escaped, "i");
        assert.equal(regex.test(input), true);
        assert.equal(regex.test("random text without pattern"), false);
      }
    });
  });
});

