import csv from "csv-parser";
import { Readable } from "stream";
import Company from "../models/companyModel.js";
import Facility from "../models/facilityModel.js";
import geocodingService from "../services/geocodingService.js";

/**
 * Upload and process CSV file with company and facility data
 */
const uploadCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No CSV file uploaded",
            });
        }

        // Validate file size (10MB limit)
        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: "File size exceeds 10MB limit",
            });
        }

        const csvData = [];
        const stream = Readable.from(req.file.buffer);

        // Parse CSV data with comma delimiter
        await new Promise((resolve, reject) => {
            stream
                .pipe(
                    csv({
                        separator: ",", // Explicitly set comma as delimiter
                        skipLines: 0,
                    })
                )
                .on("data", (row) => {
                    // Normalize column names (remove spaces, convert to lowercase)
                    const normalizedRow = {};
                    Object.keys(row).forEach((key) => {
                        const normalizedKey = key
                            .toLowerCase()
                            .replace(/\s+/g, "_")
                            .replace(/[^a-z0-9_]/g, "");

                        // Special handling for tags field
                        if (normalizedKey === "tags") {
                            // Split tags by comma and trim each tag
                            normalizedRow[normalizedKey] = row[key]
                                ? row[key]
                                      .split(",")
                                      .map((tag) => tag.trim())
                                      .filter((tag) => tag.length > 0)
                                : [];
                        } else {
                            normalizedRow[normalizedKey] = row[key]
                                ? row[key].trim()
                                : "";
                        }
                    });
                    csvData.push(normalizedRow);
                    console.log(normalizedRow);
                })
                .on("end", resolve)
                .on("error", reject);
        });

        if (csvData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "CSV file is empty or invalid",
            });
        }

        // Validate CSV structure
        const validationResult = validateCSVStructure(csvData);
        if (!validationResult.isValid) {
            return res.status(400).json({
                success: false,
                message: validationResult.message,
                requiredColumns: validationResult.requiredColumns,
                foundColumns: Object.keys(csvData[0]),
            });
        }

        const processedData = [];
        const errors = [];
        const skippedRows = [];

        console.log(`Processing ${csvData.length} rows...`);

        // Process each row with rate limiting
        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            const rowNumber = i + 1;

            try {
                // Validate required fields
                if (!row.company_name || !row.legend_color) {
                    skippedRows.push({
                        row: rowNumber,
                        reason: "Missing required fields (company_name or legend_color)",
                        data: row,
                    });
                    continue;
                }

                // Validate hex color format
                if (
                    !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(row.legend_color)
                ) {
                    skippedRows.push({
                        row: rowNumber,
                        reason: "Invalid legend_color format (must be hex color like #FF5733)",
                        data: row,
                    });
                    continue;
                }

                let locationData;

                if (validationResult.hasAddress) {
                    // Geocode address to get coordinates
                    const address = row.address || row.full_address;
                    if (!address) {
                        skippedRows.push({
                            row: rowNumber,
                            reason: "Missing address field",
                            data: row,
                        });
                        continue;
                    }
                    locationData = await geocodingService.geocodeAddress(
                        address
                    );
                } else {
                    // Reverse geocode coordinates to get address
                    const lat = Number.parseFloat(row.latitude || row.lat);
                    const lng = Number.parseFloat(
                        row.longitude || row.lng || row.lon
                    );

                    if (isNaN(lat) || isNaN(lng)) {
                        skippedRows.push({
                            row: rowNumber,
                            reason: "Invalid coordinates (latitude/longitude must be valid numbers)",
                            data: row,
                        });
                        continue;
                    }

                    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                        skippedRows.push({
                            row: rowNumber,
                            reason: "Coordinates out of valid range (lat: -90 to 90, lng: -180 to 180)",
                            data: row,
                        });
                        continue;
                    }

                    locationData = await geocodingService.reverseGeocode(
                        lat,
                        lng
                    );
                }

                // Create facility name as "City, State" or fallback to address
                let facilityName = "Unknown Location";
                if (locationData.city && locationData.state) {
                    facilityName = `${locationData.city}, ${locationData.state}`;
                } else if (locationData.city) {
                    facilityName = locationData.city;
                } else if (locationData.address) {
                    // Extract city from address as fallback
                    const addressParts = locationData.address.split(",");
                    if (addressParts.length >= 2) {
                        facilityName =
                            addressParts[addressParts.length - 2].trim();
                    }
                }

                processedData.push({
                    companyName: row.company_name,
                    legendColor: row.legend_color,
                    facilityName,
                    address: locationData.address,
                    city: locationData.city || "",
                    state: locationData.state || "",
                    zipCode: locationData.zipCode || "",
                    coordinates: locationData.coordinates,
                    tags: row.tags || [], // Include tags in processed data
                    originalRow: rowNumber,
                });

                // Add delay to respect API rate limits
                if (i < csvData.length - 1) {
                    await geocodingService.delay(
                        process.env.GEOCODING_DELAY_MS || 100
                    );
                }

                // Log progress every 10 rows
                if ((i + 1) % 10 === 0) {
                    console.log(`Processed ${i + 1}/${csvData.length} rows`);
                }
            } catch (error) {
                console.error(
                    `Error processing row ${rowNumber}:`,
                    error.message
                );
                errors.push({
                    row: rowNumber,
                    data: row,
                    error: error.message,
                });
            }
        }

        console.log(
            `Geocoding complete. Processed: ${processedData.length}, Errors: ${errors.length}, Skipped: ${skippedRows.length}`
        );

        // Group facilities by company
        const companiesMap = new Map();

        processedData.forEach((item) => {
            if (!companiesMap.has(item.companyName)) {
                companiesMap.set(item.companyName, {
                    name: item.companyName,
                    legendColor: item.legendColor,
                    facilities: [],
                });
            }

            companiesMap.get(item.companyName).facilities.push({
                name: item.facilityName,
                address: item.address,
                city: item.city,
                state: item.state,
                zipCode: item.zipCode,
                coordinates: item.coordinates,
            });
        });

        // Save to database
        const savedCompanies = [];
        const saveErrors = [];

        for (const [companyName, companyData] of companiesMap) {
            try {
                // Check if company already exists
                let company = await Company.findOne({ name: companyName });

                if (!company) {
                    // Create new company
                    company = new Company({
                        name: companyData.name,
                        legend_color: companyData.legendColor,
                    });
                    await company.save();
                    console.log(`Created new company: ${company.name}`);
                } else {
                    // Update legend color if different
                    if (company.legend_color !== companyData.legendColor) {
                        company.legend_color = companyData.legendColor;
                        await company.save();
                        console.log(
                            `Updated legend color for company: ${company.name}`
                        );
                    }
                }

                // Save facilities for this company
                const facilityPromises = companyData.facilities.map(
                    async (facilityData) => {
                        // Check if facility already exists at this location
                        const existingFacility = await Facility.findOne({
                            companyId: company._id,
                            location: {
                                $near: {
                                    $geometry: {
                                        type: "Point",
                                        coordinates: facilityData.coordinates,
                                    },
                                    $maxDistance: 100, // 100 meters tolerance
                                },
                            },
                        });

                        if (existingFacility) {
                            console.log(
                                `Facility already exists for ${company.name} at ${facilityData.city}, ${facilityData.state}`
                            );
                            return existingFacility;
                        }

                        const facility = new Facility({
                            companyId: company._id,
                            name: facilityData.name,
                            address: facilityData.address,
                            city: facilityData.city,
                            state: facilityData.state,
                            zipCode: facilityData.zipCode,
                            location: {
                                type: "Point",
                                coordinates: facilityData.coordinates,
                            },
                            tags: facilityData.tags,
                        });
                        return await facility.save();
                    }
                );

                const savedFacilities = await Promise.all(facilityPromises);

                savedCompanies.push({
                    company: company.name,
                    facilitiesCount: savedFacilities.length,
                    newFacilities: savedFacilities.filter(
                        (f) => f.isNew !== false
                    ).length,
                });
            } catch (error) {
                console.error(
                    `Error saving company ${companyName}:`,
                    error.message
                );
                saveErrors.push({
                    company: companyName,
                    error: error.message,
                });
            }
        }

        // Prepare response
        const response = {
            success: true,
            message: "CSV processed successfully",
            summary: {
                totalRows: csvData.length,
                processedRows: processedData.length,
                skippedRows: skippedRows.length,
                errorRows: errors.length,
                companiesProcessed: savedCompanies.length,
                totalFacilities: processedData.length,
            },
            companies: savedCompanies,
        };

        if (skippedRows.length > 0) {
            response.skippedRows = skippedRows;
        }

        if (errors.length > 0) {
            response.geocodingErrors = errors;
        }

        if (saveErrors.length > 0) {
            response.saveErrors = saveErrors;
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("CSV upload error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process CSV file",
            error: error.message,
        });
    }
};

/**
 * Validate CSV structure and determine data type
 * @param {Array} csvData - Parsed CSV data
 * @returns {Object} Validation result
 */
const validateCSVStructure = (csvData) => {
    if (csvData.length === 0) {
        return {
            isValid: false,
            message: "CSV file is empty",
        };
    }

    const firstRow = csvData[1];
    const columns = Object.keys(firstRow);
    console.log(columns);

    // Check for required columns
    const hasCompanyName = columns.some((col) =>
        ["company_name", "companyname", "company"].includes(col)
    );
    const hasLegendColor = columns.some((col) =>
        ["legend_color", "legendcolor", "color"].includes(col)
    );

    if (!hasCompanyName || !hasLegendColor) {
        return {
            isValid: false,
            message:
                "CSV must contain 'company_name' and 'legend_color' columns",
            requiredColumns: [
                "company_name",
                "legend_color",
                "address OR (latitude AND longitude)",
            ],
        };
    }

    // Check for address or coordinates
    const hasAddress = columns.some((col) =>
        ["address", "full_address", "fulladdress"].includes(col)
    );
    const hasCoordinates =
        columns.some((col) => ["latitude", "lat"].includes(col)) &&
        columns.some((col) => ["longitude", "lng", "lon"].includes(col));

    if (!hasAddress && !hasCoordinates) {
        return {
            isValid: false,
            message:
                "CSV must contain either 'address' column or both 'latitude' and 'longitude' columns",
            requiredColumns: [
                "company_name",
                "legend_color",
                "address OR (latitude AND longitude)",
            ],
        };
    }

    // Optional: Validate tags column if present
    if (columns.includes("tags")) {
        for (const row of csvData) {
            if (
                row.tags &&
                !Array.isArray(row.tags) &&
                typeof row.tags !== "string"
            ) {
                return {
                    isValid: false,
                    message:
                        "If present, 'tags' column must be a comma-separated string or array.",
                };
            }
        }
    }

    return {
        isValid: true,
        hasAddress,
        hasCoordinates,
    };
};

export default uploadCSV;
