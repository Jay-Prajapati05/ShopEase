import { Router } from "express";
import { getStats } from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();
const adminOnly = [protect, authorize(USER_ROLES.ADMIN)];

router.get("/stats", adminOnly, getStats);

export default router;
