import express from "express";
import { getMarkers } from "../controllers/markerController.js";

const router = express.Router();

router.get("/markers", getMarkers);

export default router;
