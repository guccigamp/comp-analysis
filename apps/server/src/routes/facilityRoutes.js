import express from "express";
import {
    getAllFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility,
    findFacilitiesNearby,
    findFacilitiesByState,
    findFacilitiesByCompany,
    getFilteredFacilities,
} from "../controllers/facilityController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllFacilities);
router.get("/filter", protect, getFilteredFacilities);
router.get("/nearby", protect, findFacilitiesNearby);
router.get("/state/:state", protect, findFacilitiesByState);
router.get("/company/:companyId", protect, findFacilitiesByCompany);
router.get("/:id", protect, getFacilityById);
router.post("/", protect, adminOnly, createFacility);
router.put("/:id", protect, adminOnly, updateFacility);
router.delete("/:id", protect, adminOnly, deleteFacility);

export default router;
