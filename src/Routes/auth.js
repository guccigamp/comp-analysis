import prisma from "../prismaClient";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { hasSubscribers } from "diagnostics_channel";

const router = express.Router();

// Authentication
// Register a User
// Endpoint: /auth/register
router.post("/register", async (req, res) => {
    // Deconstructing the parameters passed when registering a user
    const { email, password, employeeId, first_name, last_name } = req.body;

    // Hashing password using bcrypt algorithm
    const hashedPassword = bcrypt.hashSync(password, 5);

    // Saving the new user and their hashed password
    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                employeeId,
                first_name,
                last_name,
            },
        });
        // Loggging the Registeration 
        await prisma.activity.create({
            data: {
                userId: user.id,
                action: "REGISTER",
            },
        });

        // Creating a token for user
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "24h",
        });
        res.json({ token });
    } catch (error) {
        console.log(error.message);
        res.sendStatus(503);
    }
});

// Login the user
// Endpoint: /auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Validating email
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!user) {
            return res
                .status(404)
                .send({ message: "User not found or does not exists" });
        }

        // Validating password
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(404).send({ message: "Password invalid" });
        };

        // Logging the Login
        await prisma.activity.create({
            data: {
                userId: user.id,
                action: "LOGIN",
            },
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "24h",
        });
        res.json({ token });
    } catch (error) {
        console.log(error.message);
        res.sendStatus(503);
    }
});

export default router;
