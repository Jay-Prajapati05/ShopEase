import { Router } from "express";
import {
  getProducts,
  getCategories,
  getBestsellers,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getReviewStatus,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/product.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();
const adminOnly = [protect, authorize(USER_ROLES.ADMIN)];

router.get("/", getProducts);
router.get("/categories", getCategories); // must stay above /:id
router.get("/bestsellers", getBestsellers); // must stay above /:id
router.get("/:id", getProduct);

router.get("/:id/review-status", protect, getReviewStatus);
router.post("/:id/reviews", protect, createReview);
router.put("/:id/reviews", protect, updateReview);
router.delete("/:id/reviews", protect, deleteReview);

router.post("/", adminOnly, createProduct);
router.put("/:id", adminOnly, updateProduct);
router.delete("/:id", adminOnly, deleteProduct);

export default router;
