import express from "express";
import multer from "multer";
import uploadCSV from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for memory storage (don't save files to disk)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "text/csv" ||
            file.originalname.endsWith(".csv")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed"), false);
        }
    },
});

// POST /api/upload/admin - Upload CSV file with company and facility data
router.post("", protect, upload.single("file"), uploadCSV);

export default router;
