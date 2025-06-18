import express from "express";
import { captureMapScreenshot } from "../controllers/screenshotController.js";

const router = express.Router();

// POST /api/map/screenshot
router.post("/screenshot", captureMapScreenshot);

export default router;
