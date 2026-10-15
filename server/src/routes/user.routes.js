import { Router } from "express";
import { getAllUsers, deleteUser } from "../controllers/user.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();
const adminOnly = [protect, authorize(USER_ROLES.ADMIN)];

router.get("/", adminOnly, getAllUsers);
router.delete("/:id", adminOnly, deleteUser);

export default router;
