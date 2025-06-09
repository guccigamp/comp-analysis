import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// Middleware
// app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev")); // HTTP request logger

app.use("/api", routes);
app.use("/health", async (req, res) => {
    res.send({ message: "API is up" });
});

// Error handling middleware
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

export default app;
