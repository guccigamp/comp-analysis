import Facility from "../models/facilityModel.js";
import Company from "../models/companyModel.js";
import geocoder from "../services/geocodingService.js";

// Get all facilities
export const getAllFacilities = async (req, res, next) => {
    try {
        const facilities = await Facility.find({ active: true }).populate(
            "companyId",
            "name legend_color"
        );

        res.status(200).json(facilities);
    } catch (error) {
        next(error);
    }
};

// Get facility by ID
export const getFacilityById = async (req, res, next) => {
    try {
        const facility = await Facility.findById(req.params.id).populate(
            "companyId",
            "name legend_color"
        );

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
            ...facilityData
        } = req.body;

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

        const facility = new Facility({
            ...facilityData,
            address,
            name,
            city,
            state,
            zipCode,
            companyId,
            location: {
                type: "Point",
                coordinates: [longitude, latitude], // GeoJSON uses [longitude, latitude]
            },
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
        const { latitude, longitude, ...updateData } = req.body;

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
            unit === "kilometers" ? radius * 1000 : radius * 1609.34; // miles to meters

        const facilities = await Facility.find({
            active: true,
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            parseFloat(longitude),
                            parseFloat(latitude),
                        ],
                    },
                    $maxDistance: radiusInMeters,
                },
            },
        }).populate("companyId", "name legend_color");

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
        }).populate("companyId", "name legend_color");

        res.status(200).json(facilities);
    } catch (error) {
        next(error);
    }
};

// Get facilities with advanced filtering
export const getFilteredFacilities = async (req, res, next) => {
    try {
        const {
            companies,
            states,
            searchTerm,
            latitude,
            longitude,
            radius,
            unit,
        } = req.query;

        // Build query
        const query = { active: true };

        // Filter by companies
        if (companies) {
            const companyIds = companies.split(",");
            query.companyId = { $in: companyIds };
        }

        // Filter by states
        if (states) {
            const stateList = states.split(",");
            query.state = { $in: stateList };
        }

        // Filter by search term
        if (searchTerm) {
            const searchRegex = new RegExp(searchTerm, "i");
            query.$or = [
                { address: searchRegex },
                { state: searchRegex },
                { city: searchRegex },
            ];
        }

        // Filter by proximity if coordinates are provided
        let facilities;

        if (latitude && longitude && radius) {
            const radiusInMeters =
                unit === "kilometers"
                    ? parseFloat(radius) * 1000
                    : parseFloat(radius) * 1609.34;

            facilities = await Facility.find({
                ...query,
                location: {
                    $nearSphere: {
                        $geometry: {
                            type: "Point",
                            coordinates: [
                                parseFloat(longitude),
                                parseFloat(latitude),
                            ],
                        },
                        $maxDistance: radiusInMeters,
                    },
                },
            }).populate("companyId", "name legend_color");
        } else {
            facilities = await Facility.find(query).populate(
                "companyId",
                "name legend_color"
            );
        }

        res.status(200).json(facilities);
    } catch (error) {
        next(error);
    }
};
