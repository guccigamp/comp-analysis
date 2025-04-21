import prisma from "../prisma.js";
import express from "express";

const router = express.Router();

const ALLOWED_FILTERS = new Set(["id", "state"]);

// Get facilities
// filter_by: id, state
// Endpoint: GET /api/facilities
router.get("/facilities", async (req, res) => {
    const { filter_by, params } = req.query;

    // Build a dynamic `where` object
    const where = {};
    if (filter_by && params) {
        // Validate filter
        if (!ALLOWED_FILTERS.has(filter_by)) {
            res.status(400).send({ message: `Cannot filter by ${filter_by}` });
        }

        // Splitting params by commas
        const values = params.split(",");

        // If there's only one value, you might want an exact match:
        where[filter_by] =
            values.length === 1 ? { equals: values[0] } : { in: values };
    }
        // Querying all facilities
        const facilities = await prisma.facilty.findMany({
            where,
            include: { company: true },
        });
            // Logging the activity
    await prisma.activity.create({
        data: {
            userId: req.userId,
            action: `Queried facilities${filter_by ? ("by " + filter_by) : ""}    Timestamp: ${new Date()}`,
        },
    });
    res.json(facilities);
})
export default router;