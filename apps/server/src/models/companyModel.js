import mongoose from "mongoose";
import autopopulate from "mongoose-autopopulate";

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
            unique: true,
            minlength: [2, "Company name must be at least 2 characters long"],
            maxlength: [200, "Company name cannot exceed 200 characters"],
            validate: {
                validator: (name) => {
                    // Allow letters, numbers, spaces, and common business characters
                    return /^[A-Za-z0-9\s\-&'.,()]+$/.test(name);
                },
                message: "Company name contains invalid characters",
            },
        },
        legend_color: {
            type: String,
            required: [true, "Legend color is required"],
            default: "#000000",
            validate: {
                validator: (color) => {
                    // Validate hex color format (#RGB or #RRGGBB)
                    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
                },
                message:
                    "Legend color must be a valid hex color (e.g., #FF5733 or #F53)",
            },
        },
        active: {
            type: Boolean,
            default: true,
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
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for facilities
companySchema.plugin(autopopulate).virtual("facilities", {
    ref: "Facility",
    localField: "_id",
    foreignField: "companyId",
    autopopulate: true,
});

// Add indexes for faster queries
companySchema.index({ name: 1 });
companySchema.index({ active: 1 });

// Instance method to get active facilities
companySchema.methods.getActiveFacilities = function () {
    return mongoose.model("Facility").find({
        companyId: this._id,
        active: true,
    });
};

const Company = mongoose.model("Company", companySchema);

export default Company;
