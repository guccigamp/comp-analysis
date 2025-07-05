import express from "express";
import {
    registerUser,
    loginUser,
    updateUserProfile,
    changePassword,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", protect, adminOnly, registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

export default router;
