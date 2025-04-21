import prisma from "../prisma.js";
import express from "express";

const router = express.Router();

const ALLOWED_FILTERS = new Set(["id", "name"]);

// Get all companies
// filter_by: id, name
// Endpoint: GET /api/companies
router.get("/companies", async (req, res) => {
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
        console.log(values);

        // If there's only one value, you might want an exact match:
        where[filter_by] =
            values.length === 1 ? { equals: values[0] } : { in: values };
    }

    // Querying all companies
    const companies = await prisma.company.findMany({
        where,
        include: { facility: true },
    });
    // Logging the activity
    await prisma.activity.create({
        data: {
            userId: req.userId,
            action: `Queried all companies${filter_by ? ("by " + filter_by) : ""}    Timestamp: ${new Date()}`,
        },
    });
    res.json(companies);
});

// Get company facilities by id
// Endpoint: GET /api/companies/:id
router.get("/companies/:id", async (req, res) => {
    const { id } = req.params;

    // Querying company by id
    const company = await prisma.company.findMany({
        where: {
            id: id,
        },
        include: {
            facility: true,
        },
    });
    // Logging the activity
    await prisma.activity.create({
        data: {
            userId: req.userId,
            action: `Queried company facilities by ID    Timestamp: ${new Date()}`,
        },
    });
    res.json(company);
});

export default router;
