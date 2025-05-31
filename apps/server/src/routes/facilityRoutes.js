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

const router = express.Router();

router.get("/", getAllFacilities);
router.get("/filter", getFilteredFacilities);
router.get("/nearby", findFacilitiesNearby);
router.get("/state/:state", findFacilitiesByState);
router.get("/company/:companyId", findFacilitiesByCompany);
router.get("/:id", getFacilityById);
router.post("/", createFacility);
router.put("/:id", updateFacility);
router.delete("/:id", deleteFacility);

export default router;
