import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;