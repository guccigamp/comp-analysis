import Facility from "../models/facilityModel.js";
import Company from "../models/companyModel.js";
import geocoder from "../services/geocodingService.js";
import mongoose from "mongoose";
import {
    filterFacilitiesByTags,
    removeDuplicateTags,
    getTagStatistics,
} from "../utils/tagHelpers.js";
import User from "../models/userModel.js";

// Get all facilities
export const getAllFacilities = async (req, res, next) => {
    try {
        const facilities = await Facility.find({
            active: true,
            access: req.user._id,
        }).populate("companyId", "name legend_color");

        res.status(200).json(facilities);
    } catch (error) {
        next(error);
    }
};

// Get facility by ID
export const getFacilityById = async (req, res, next) => {
    try {
        const facility = await Facility.find({
            _id: req.params.id,
            active: true,
            access: req.user.id,
        }).populate("companyId", "name legend_color");

        if (!facility) {
            return res.status(404).json({ message: "Facility not found" });
        }

        res.status(200).json(facility);
    } catch (error) {
        next(error);
    }
};

// Create new facility
export const createFacility = async (req, res, next) => {
    try {
        let {
            latitude,
            longitude,
            companyId,
            address,
            state,
            city,
            name,
            zipCode,
            tags,
            ...facilityData
        } = req.body;

        // Process tags if provided
        if (tags) {
            tags = removeDuplicateTags(Array.isArray(tags) ? tags : [tags]);
        }

        // Geocode address to get coordinates
        if (!latitude && !longitude && address) {
            const locationData = await geocoder.geocodeAddress(address);
            longitude = locationData.coordinates[0];
            latitude = locationData.coordinates[1];
            console.log({ longitude, latitude });
        } else if (!address) {
            const locationData = await geocoder.reverseGeocode(
                latitude,
                longitude
            );
            address = locationData.address;
            city = locationData.city;
            state = locationData.state;
            zipCode = locationData.zipCode;
            console.log({ address, city, state, zipCode });
        }
        // Create a name if not given
        if (!name) {
            name = `${city}, ${state}`;
        }

        // Check if company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        const users = await User.find();
        const userIds = users.map((user) => user._id);

        const facility = new Facility({
            ...facilityData,
            address,
            name,
            city,
            state,
            zipCode,
            companyId,
            tags,
            location: {
                type: "Point",
                coordinates: [longitude, latitude], // GeoJSON uses [longitude, latitude]
            },
            access: userIds, // Give access to all users
        });

        await facility.save();
        res.status(201).json(facility);
    } catch (error) {
        next(error);
    }
};

// Update facility
export const updateFacility = async (req, res, next) => {
    try {
        const { latitude, longitude, tags, ...updateData } = req.body;

        // Process tags if provided
        if (tags) {
            updateData.tags = removeDuplicateTags(
                Array.isArray(tags) ? tags : [tags]
            );
        }

        // Update location if coordinates are provided
        if (latitude !== undefined && longitude !== undefined) {
            updateData.location = {
                type: "Point",
                coordinates: [longitude, latitude],
            };
        }

        const facility = await Facility.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate("companyId", "name legend_color");

        if (!facility) {
            return res.status(404).json({ message: "Facility not found" });
        }

        res.status(200).json(facility);
    } catch (error) {
        next(error);
    }
};

// Delete facility
export const deleteFacility = async (req, res, next) => {
    try {
        const facility = await Facility.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        );

        if (!facility) {
            return res.status(404).json({ message: "Facility not found" });
        }

        res.status(200).json({ message: "Facility deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// Find facilities within radius
export const findFacilitiesNearby = async (req, res, next) => {
    try {
        const { latitude, longitude, radius = 50, unit = "miles" } = req.query;

        // Convert radius to meters (MongoDB uses meters for $geoNear)
        const radiusInMeters =
            unit === "kilometers" ? radius * 1000 : radius * 1609.34;

        const pipeline = [
            {
                $match: {
                    active: true,
                    access: req.user._id,
                },
            },
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [
                            parseFloat(longitude),
                            parseFloat(latitude),
                        ],
                    },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: radiusInMeters,
                    query: { active: true },
                },
            },
            {
                $lookup: {
                    from: "companies",
                    localField: "companyId",
                    foreignField: "_id",
                    as: "companyId",
                },
            },
            {
                $unwind: {
                    path: "$companyId",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    address: 1,
                    city: 1,
                    state: 1,
                    zipCode: 1,
                    tags: 1,
                    location: 1,
                    active: 1,
                    "companyId._id": 1,
                    "companyId.name": 1,
                    "companyId.legend_color": 1,
                    distance: 1,
                },
            },
        ];

        let facilities = await Facility.aggregate(pipeline);

        // Convert distance to requested unit
        facilities = facilities.map((facility) => ({
            ...facility,
            distance:
                unit === "kilometers"
                    ? facility.distance / 1000
                    : facility.distance / 1609.34, // Convert meters to miles
        }));

        res.status(200).json(facilities);
    } catch (error) {
        next(error);
    }
};

// Find facilities by state
export const findFacilitiesByState = async (req, res, next) => {
    try {
        const { state } = req.params;

        const facilities = await Facility.find({
            active: true,
            state: { $regex: new RegExp(state, "i") },
            access: req.user._id,
        }).populate("companyId", "name legend_color");

        res.status(200).json(facilities);
    } catch (error) {
        next(error);
    }
};

// Find facilities by company
export const findFacilitiesByCompany = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const facilities = await Facility.find({
            active: true,
            companyId,
            access: req.user._id,
        }).populate("companyId", "name legend_color");

        res.status(200).json(facilities);
    } catch (error) {
        next(error);
    }
};

// Get filtered facilities
export const getFilteredFacilities = async (req, res, next) => {
    try {
        const {
            companyId,
            state,
            city,
            tags,
            matchAllTags = false,
            radius,
            latitude,
            longitude,
            unit = "miles",
        } = req.query;

        // Build match stage for filtering – always include current user.
        let matchStage = {
            active: true,
            access: req.user._id,
        };

        // Add company filter – accept multiple IDs separated by comma or pipe, or repeated params
        if (companyId) {
            const rawIds = Array.isArray(companyId)
                ? companyId
                : companyId.split(/[,|]/);
            matchStage.companyId = {
                $in: rawIds.map((id) => new mongoose.Types.ObjectId(id)),
            };
        }

        // Add state filter
        if (state) {
            const stateList = Array.isArray(state)
                ? state
                : state.split(/[,|]/);
            matchStage.state = {
                $in: stateList.map((s) => new RegExp(s, "i")),
            };
        }

        // Add city filter
        if (city) {
            const cityList = Array.isArray(city) ? city : city.split(",");
            matchStage.city = { $in: cityList.map((c) => new RegExp(c, "i")) };
        }

        // -------- Aggregation pipeline --------
        const pipeline = [];

        if (latitude && longitude) {
            // $geoNear **must** be the first stage in the pipeline per MongoDB docs.
            const radiusInMeters = radius
                ? unit === "kilometers"
                    ? radius * 1000
                    : radius * 1609.34
                : 1_000_000; // default 1000 km

            pipeline.push({
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [
                            parseFloat(longitude),
                            parseFloat(latitude),
                        ],
                    },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: radiusInMeters,
                    query: matchStage, // All filters must be in the query field for $geoNear
                },
            });
        } else {
            // For non-geo queries, start with $match
            pipeline.push({ $match: matchStage });
        }

        // Add lookup stage for company information
        pipeline.push({
            $lookup: {
                from: "companies",
                localField: "companyId",
                foreignField: "_id",
                as: "companyId",
            },
        });

        // Unwind the company array
        pipeline.push({
            $unwind: {
                path: "$companyId",
                preserveNullAndEmptyArrays: true,
            },
        });

        // Project only needed company fields
        pipeline.push({
            $project: {
                _id: 1,
                name: 1,
                address: 1,
                city: 1,
                state: 1,
                zipCode: 1,
                tags: 1,
                location: 1,
                active: 1,
                "companyId._id": 1,
                "companyId.name": 1,
                "companyId.legend_color": 1,
                distance: 1,
                access: 1,
            },
        });

        // Execute aggregation
        let facilities = await Facility.aggregate(pipeline);

        // Convert distance to requested unit if coordinates were provided
        if (latitude && longitude) {
            facilities = facilities.map((facility) => ({
                ...facility,
                distance:
                    unit === "kilometers"
                        ? facility.distance / 1000
                        : facility.distance / 1609.34, // Convert meters to miles
            }));
        }

        // Apply tag filtering if tags are provided
        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : [tags];
            facilities = filterFacilitiesByTags(
                facilities,
                tagArray,
                matchAllTags === "true"
            );
        }

        res.status(200).json(facilities);
    } catch (error) {
        next(error);
    }
};

// Get all unique tags
export const getAllTags = async (req, res, next) => {
    try {
        const facilities = await Facility.find({
            active: true,
            access: req.user._id,
        });
        const { tagCounts } = getTagStatistics(facilities);

        // Convert to array of { tag, count } objects and sort by count
        const tags = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);

        res.status(200).json(tags);
    } catch (error) {
        next(error);
    }
};

// Get facilities by tag
export const getFacilitiesByTag = async (req, res, next) => {
    try {
        const { tag } = req.params;
        const { companyId } = req.query;

        let query = {
            active: true,
            tags: { $regex: new RegExp(tag, "i") },
            access: req.user.id,
        };

        // Filter by company if provided
        if (companyId) {
            query.companyId = companyId;
        }

        const facilities = await Facility.find(query).populate(
            "companyId",
            "name legend_color"
        );

        res.status(200).json(facilities);
    } catch (error) {
        next(error);
    }
};
