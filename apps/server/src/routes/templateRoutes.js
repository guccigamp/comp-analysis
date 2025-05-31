import express from "express";
import templateController from "../controllers/templateController.js";

const router = express.Router();

// GET /api/templates/address - Download sample address-based CSV template
router.get("/address", templateController.getSampleAddressTemplate);

// GET /api/templates/coordinates - Download sample coordinates-based CSV template
router.get("/coordinates", templateController.getSampleCoordinatesTemplate);

export default router;
