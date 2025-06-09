import express from "express";
import companyRoutes from "./companyRoutes.js";
import facilityRoutes from "./facilityRoutes.js";
import templateRoutes from "./templateRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import authRoutes from "./authRoutes.js";
import markerRoutes from "./markerRoutes.js";

const router = express.Router();

router.use("/companies", companyRoutes);
router.use("/facilities", facilityRoutes);
router.use("/templates", templateRoutes);
router.use("/upload", uploadRoutes);
router.use("/auth", authRoutes);
router.use("", markerRoutes);

export default router;
