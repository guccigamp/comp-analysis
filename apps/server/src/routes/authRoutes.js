import express from "express";
import {
    registerUser,
    loginUser,
    updateUserProfile,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateUserProfile);

export default router;
