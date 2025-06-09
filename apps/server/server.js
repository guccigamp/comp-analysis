import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB()
    .then(() => {
        // Start the server
        app.listen(PORT, () => {
            console.log(
                `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
            );
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    });
