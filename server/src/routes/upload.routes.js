import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Only authenticated admins can upload images
router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN),
  uploadSingleImage,
  uploadImage
);

export default router;
