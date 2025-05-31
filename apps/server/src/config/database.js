import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${connection.connection.host}`);

        // Create geospatial indexes if they don't exist
        const collections = await mongoose.connection.db
            .listCollections()
            .toArray();
        if (collections.some((coll) => coll.name === "facilities")) {
            await mongoose.connection.db
                .collection("facilities")
                .createIndex({ location: "2dsphere" });
            console.log("Geospatial index created on facilities collection");
        }
        return connection;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
