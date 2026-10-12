import { Router } from "express";
import {
  getProducts,
  getCategories,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();
const adminOnly = [protect, authorize(USER_ROLES.ADMIN)];

router.get("/", getProducts);
router.get("/categories", getCategories); // must stay above /:id
router.get("/:id", getProduct);

router.post("/", adminOnly, createProduct);
router.put("/:id", adminOnly, updateProduct);
router.delete("/:id", adminOnly, deleteProduct);

export default router;
