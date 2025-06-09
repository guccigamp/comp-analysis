import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Middleware to protect routes
export const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1]; // Extract token
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Token Verification
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } else {
            res.status(401).json({ message: "Not authorized, no token" });
        }
    } catch (error) {
        res.status(401).json({ message: "Token failed", error: error.message });
    }
};

// Middleware to direct the user based on their role
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied, admin only" });
    }
};
