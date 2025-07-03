import mongoose from "mongoose";

// Define the GeoJSON point schema for facility location
const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
    },
});

const facilitySchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company ID is required"],
            index: true,
        },
        name: {
            type: String,
            trim: true,
            maxlength: [200, "Facility name cannot exceed 200 characters"],
            validate: {
                validator: (name) => !name || name.length > 0,
                message: "Facility name cannot be empty if provided",
            },
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            minlength: [5, "Address must be at least 5 characters long"],
            maxlength: [500, "Address cannot exceed 500 characters"],
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true,
            minlength: [2, "State must be at least 2 characters long"],
            maxlength: [50, "State cannot exceed 50 characters"],
            validate: {
                validator: (state) => {
                    // Allow state codes (2 chars) or full state names
                    return /^[A-Za-z\s]{2,50}$/.test(state);
                },
                message: "State must contain only letters and spaces",
            },
        },
        city: {
            type: String,
            trim: true,
            maxlength: [100, "City name cannot exceed 100 characters"],
            validate: {
                validator: (city) =>
                    !city || /^[A-Za-z\s\-'.]{1,100}$/.test(city),
                message:
                    "City must contain only letters, spaces, hyphens, apostrophes, and periods",
            },
        },
        zipCode: {
            type: String,
            trim: true,
            validate: {
                validator: (zipCode) => {
                    if (!zipCode) return true; // Optional field
                    // US ZIP code format: 12345 or 12345-6789
                    return /^\d{5}(-\d{4})?$/.test(zipCode);
                },
                message: "ZIP code must be in format 12345 or 12345-6789",
            },
        },
        location: {
            type: pointSchema,
            required: [true, "Location coordinates are required"],
            index: "2dsphere", // Create a geospatial index
        },
        tags: {
            type: [String],
            default: [],
        },
        active: {
            type: Boolean,
            default: true,
        },
        access: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [], // Will be populated in controller
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
        updated_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

// Pre-save middleware to validate coordinates
facilitySchema.pre("save", function (next) {
    if (this.location && this.location.coordinates) {
        const [lng, lat] = this.location.coordinates;
        if (lng < -180 || lng > 180) {
            return next(new Error("Longitude must be between -180 and 180"));
        }
        if (lat < -90 || lat > 90) {
            return next(new Error("Latitude must be between -90 and 90"));
        }
    }
    next();
});

// Method to set location from latitude and longitude
facilitySchema.methods.setLocation = function (latitude, longitude) {
    // Validate coordinates before setting
    if (typeof latitude !== "number" || typeof longitude !== "number") {
        throw new Error("Latitude and longitude must be numbers");
    }
    if (latitude < -90 || latitude > 90) {
        throw new Error("Latitude must be between -90 and 90");
    }
    if (longitude < -180 || longitude > 180) {
        throw new Error("Longitude must be between -180 and 180");
    }

    this.location = {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON uses [longitude, latitude] order
    };
};

// Add compound indexes for faster queries
facilitySchema.index({ location: "2dsphere" });
facilitySchema.index({ companyId: 1, state: 1 });
facilitySchema.index({ companyId: 1, city: 1 });
facilitySchema.index({ companyId: 1, active: 1 });
facilitySchema.index({ name: 1 }); // Add explicit index for name field

const Facility = mongoose.model("Facility", facilitySchema);

export default Facility;
