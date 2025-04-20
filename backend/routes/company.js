import prisma from "../prisma";
import express from "express";

const router = express.Router();

// Get all companies
// Endpoint: /api/companies
router.get("/companies", async (req, res) => {

    // Querying all companies
    const companies = await prisma.company.findMany()
    // Logging the activity
    await prisma.activity.create({
        data: {
            userId: user.id,
            action: "VIEW_ALL",
        },
    });
    res.json(companies)
});


export default router;