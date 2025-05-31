import express from "express";
import companyRoutes from "./companyRoutes.js";
import facilityRoutes from "./facilityRoutes.js";
import templateRoutes from "./templateRoutes.js";
import uploadRoutes from "./uploadRoutes.js";

const router = express.Router();

router.use("/companies", companyRoutes);
router.use("/facilities", facilityRoutes);
router.use("/templates", templateRoutes);
router.use("/upload", uploadRoutes);

export default router;
