import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",
    });
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, employeeId, adminInviteToken } =
            req.body;

        // If user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
        }

        // Determine user role: Admin if correct token is provided, otherwise Member
        let role = "user";
        if (
            adminInviteToken &&
            adminInviteToken == process.env.ADMIN_INVITE_TOKEN
        ) {
            role = "admin";
        }

        // Hash Password

        const hashedPassword = await bcrypt.hash(password, 8);

        // Create new User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            employeeId,
            role,
        });

        // Return user data with JWT
        res.status(201).json({
            _id: user._id,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        // hashed password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        // Return user data with JWT
        res.json({
            _id: user._id,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.password = req.body.password
            ? await bcrypt.hash(req.body.password, 8)
            : user.password;

        const updateUser = await user.save();
        res.json({
            _id: updateUser._id,
            name: updateUser.name,
            email: updateUser.email,
            role: updateUser.role,
            employeeId: updateUser.employeeId,
            token: generateToken(updateUser._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
