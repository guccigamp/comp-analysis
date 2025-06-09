import express from "express";
import {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
} from "../controllers/companyController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllCompanies);
router.get("/:id", protect, getCompanyById);
router.post("/", protect, adminOnly, createCompany);
router.put("/:id", protect, adminOnly, updateCompany);
router.delete("/:id", protect, adminOnly, deleteCompany);

export default router;
