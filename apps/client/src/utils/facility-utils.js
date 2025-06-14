// Utility functions for working with facility data from API

// Transform API facility data to match the expected format
export const transformFacilityData = (facilities) => {
    return facilities.map((facility) => ({
        id: facility._id,
        companyId: facility.companyId._id,
        companyName: facility.companyId.name,
        address: facility.address,
        state: facility.state,
        city: facility.city,
        latitude: facility.location.coordinates[1], // GeoJSON format: [lng, lat]
        longitude: facility.location.coordinates[0],
        color: facility.companyId.legend_color,
        name: facility.name,
        zipCode: facility.zipCode,
        active: facility.active,
        created_at: facility.created_at,
        updated_at: facility.updated_at,
        tags: facility.tags || [],
        distance: Math.round(facility.distance),
    }));
};

// Transform API company data
export const transformCompanyData = (companies) => {
    return companies.map((company) => ({
        id: company._id,
        name: company.name,
        color: company.legend_color,
        active: company.active,
        facilities: company.facilities
            ? transformFacilityData(company.facilities)
            : [],
        created_at: company.created_at,
        updated_at: company.updated_at,
    }));
};

// Extract city from address
export function extractCityFromAddress(address) {
    if (!address) return "";
    const parts = address.split(",").map((part) => part.trim());
    if (parts.length >= 2) {
        const cityPart = parts[parts.length - 2];
        return cityPart.replace(/\d+.*$/, "").trim();
    }
    return "";
}

// Get unique cities from facilities
export function getUniqueCities(facilities) {
    const citySet = new Set();
    facilities.forEach((facility) => {
        // Use the city field if available, otherwise extract from address
        const city = facility.city || extractCityFromAddress(facility.address);
        if (city) {
            citySet.add(city);
        }
    });
    return Array.from(citySet).sort();
}

// Get unique states from facilities
export const getUniqueStates = (facilities) => {
    const stateSet = new Set();
    facilities.forEach((facility) => {
        if (facility.state) {
            stateSet.add(facility.state);
        }
    });
    return Array.from(stateSet).sort();
};

// Get unique companies from facilities
export const getUniqueCompanies = (facilities) => {
    const companyMap = new Map();

    facilities.forEach((facility) => {
        companyMap.set(facility.companyId, facility.companyName);
    });

    return Array.from(companyMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
};

// Search facilities with multiple criteria
export function searchFacilities(facilities, searchTerm) {
    if (!searchTerm.trim()) return facilities;

    const searchLower = searchTerm.toLowerCase();

    return facilities.filter((facility) => {
        const city = facility.city || extractCityFromAddress(facility.address);

        return (
            facility.companyName.toLowerCase().includes(searchLower) ||
            facility.address.toLowerCase().includes(searchLower) ||
            facility.state.toLowerCase().includes(searchLower) ||
            city.toLowerCase().includes(searchLower) ||
            (facility.name && facility.name.toLowerCase().includes(searchLower))
        );
    });
}

// Get company summaries from transformed data
export const getCompanySummaries = (companies) => {
    return companies
        .map((company) => ({
            id: company.id,
            name: company.name,
            color: company.color,
            count: company.facilities ? company.facilities.length : 0,
        }))
        .sort((a, b) => b.count - a.count);
};

// Get state summaries from facilities
export const getStateSummaries = (facilities) => {
    const stateCount = {};

    facilities.forEach((facility) => {
        if (facility.state) {
            if (stateCount[facility.state]) {
                stateCount[facility.state]++;
            } else {
                stateCount[facility.state] = 1;
            }
        }
    });

    return Object.entries(stateCount)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count);
};

// Get total facilities count
export const getTotalFacilitiesCount = (facilities) => {
    return facilities.length;
};

// Get top companies by facility count
export const getTopCompanies = (companies, limit = 5) => {
    return getCompanySummaries(companies).slice(0, limit);
};

// Get average facilities per company
export const getAverageFacilitiesPerCompany = (companies) => {
    if (companies.length === 0) return 0;
    const totalFacilities = companies.reduce(
        (total, company) =>
            total + (company.facilities ? company.facilities.length : 0),
        0
    );
    return totalFacilities / companies.length;
};

// Update the buildApiFilters function to be more comprehensive
// Build API filter object from search context filters
export const buildApiFilters = (filters) => {
    const apiFilters = {};

    // Basic filters
    if (filters.searchTerm) {
        apiFilters.searchTerm = filters.searchTerm;
    }

    if (filters.selectedCompanies?.length > 0) {
        apiFilters.companies = filters.selectedCompanies;
    }

    if (filters.selectedStates?.length > 0) {
        apiFilters.states = filters.selectedStates;
    }

    // Handle proximity search
    if (filters.proximity?.enabled && filters.proximity?.center) {
        apiFilters.latitude = filters.proximity.center.latitude;
        apiFilters.longitude = filters.proximity.center.longitude;
        apiFilters.radius = filters.proximity.radius;
        apiFilters.unit = filters.proximity.unit;
    }

    // Handle advanced filters
    if (filters.advanced) {
        // Combine advanced company filters with main company filters
        if (filters.advanced.selectedCompanies?.length > 0) {
            const allCompanies = [
                ...(apiFilters.companies || []),
                ...filters.advanced.selectedCompanies,
            ];
            apiFilters.companies = [...new Set(allCompanies)]; // Remove duplicates
        }

        // Handle advanced state filters (regions + individual states)
        if (
            filters.advanced.selectedRegions?.length > 0 ||
            filters.advanced.selectedStates?.length > 0
        ) {
            const regionStates = [];

            // Map regions to states
            const regionStateMapping = {
                northeast: [
                    "ME",
                    "NH",
                    "VT",
                    "MA",
                    "RI",
                    "CT",
                    "NY",
                    "NJ",
                    "PA",
                ],
                southeast: [
                    "DE",
                    "MD",
                    "DC",
                    "VA",
                    "WV",
                    "KY",
                    "TN",
                    "NC",
                    "SC",
                    "GA",
                    "FL",
                    "AL",
                    "MS",
                    "AR",
                    "LA",
                ],
                midwest: [
                    "OH",
                    "MI",
                    "IN",
                    "WI",
                    "IL",
                    "MN",
                    "IA",
                    "MO",
                    "ND",
                    "SD",
                    "NE",
                    "KS",
                ],
                southwest: ["TX", "OK", "NM", "AZ"],
                west: [
                    "MT",
                    "WY",
                    "CO",
                    "UT",
                    "ID",
                    "WA",
                    "OR",
                    "NV",
                    "CA",
                    "AK",
                    "HI",
                ],
                international: ["Qro.", "B.C."],
            };

            // Add states from selected regions
            filters.advanced.selectedRegions?.forEach((regionKey) => {
                const states = regionStateMapping[regionKey];
                if (states) {
                    regionStates.push(...states);
                }
            });

            // Combine with individually selected states
            const allStates = [
                ...(apiFilters.states || []),
                ...regionStates,
                ...(filters.advanced.selectedStates || []),
            ];

            apiFilters.states = [...new Set(allStates)]; // Remove duplicates
        }
    }

    return apiFilters;
};
