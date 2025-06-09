import express from "express";
import templateController from "../controllers/templateController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/templates/address - Download sample address-based CSV template
router.get("/address", protect, templateController.getSampleAddressTemplate);

// GET /api/templates/coordinates - Download sample coordinates-based CSV template
router.get(
    "/coordinates",
    protect,
    templateController.getSampleCoordinatesTemplate
);

export default router;
