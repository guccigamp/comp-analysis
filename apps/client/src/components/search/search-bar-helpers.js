/**
 * @file search-bar-helpers.js
 * @description Contains constants and pure helper functions for the SearchBar component.
 */

// --- CONSTANTS ---

// Region definitions for geographic filtering
export const US_REGIONS = {
    northeast: {
        name: "Northeast",
        states: ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"],
    },
    southeast: {
        name: "Southeast",
        states: [
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
    },
    midwest: {
        name: "Midwest",
        states: [
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
    },
    southwest: { name: "Southwest", states: ["TX", "OK", "NM", "AZ"] },
    west: {
        name: "West",
        states: [
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
    },
    international: { name: "International", states: ["Qro.", "B.C."] },
};

// Filter type configurations for styling and icons
export const FILTER_TYPES = {
    text: { label: "Text", color: "bg-blue-100 text-blue-800 border-blue-200" },
    company: {
        label: "Company",
        color: "bg-green-100 text-green-800 border-green-200",
    },
    state: {
        label: "State",
        color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    city: {
        label: "City",
        color: "bg-orange-100 text-orange-800 border-orange-200",
    },
    tag: { label: "Tag", color: "bg-pink-100 text-pink-800 border-pink-200" },
    region: {
        label: "Region",
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
};

// --- HELPER FUNCTIONS ---

/**
 * Generates an array of display chips from the search context filters.
 * @param {object} filters - The filters object from useSearch context.
 * @param {object} availableOptions - The lists of all possible companies, states, etc.
 * @returns {Array<object>} An array of chip objects for rendering.
 */
export function generateSelectedFilterChips(filters, availableOptions) {
    const chips = [];

    // Text search
    if (filters.searchTerm) {
        chips.push({
            id: `text-${filters.searchTerm}`,
            type: "text",
            value: filters.searchTerm,
            display: filters.searchTerm,
        });
    }

    // Companies
    filters.selectedCompanies.forEach((companyId) => {
        const company = availableOptions.companies.find(
            (c) => c.id === companyId
        );
        if (company) {
            chips.push({
                id: `company-${company.id}`,
                type: "company",
                value: company.id,
                display: company.name,
            });
        }
    });

    // States
    filters.selectedStates.forEach((state) => {
        chips.push({
            id: `state-${state}`,
            type: "state",
            value: state,
            display: state,
        });
    });

    // Cities
    filters.selectedCities.forEach((city) => {
        chips.push({
            id: `city-${city}`,
            type: "city",
            value: city,
            display: city,
        });
    });

    // Advanced filters - Regions
    filters.advanced?.selectedRegions?.forEach((regionKey) => {
        const region = US_REGIONS[regionKey];
        if (region) {
            chips.push({
                id: `region-${regionKey}`,
                type: "region",
                value: regionKey,
                display: region.name,
            });
        }
    });

    // Advanced filters - States (not part of a fully selected region)
    if (filters.advanced?.selectedStates) {
        const regionStates = (filters.advanced.selectedRegions || []).flatMap(
            (key) => US_REGIONS[key]?.states || []
        );
        filters.advanced.selectedStates.forEach((stateCode) => {
            if (!regionStates.includes(stateCode)) {
                chips.push({
                    id: `advanced-state-${stateCode}`,
                    type: "state",
                    value: stateCode,
                    display: stateCode,
                });
            }
        });
    }

    // Advanced filters - Companies
    if (filters.advanced?.selectedCompanies) {
        filters.advanced.selectedCompanies.forEach((companyId) => {
            const company = availableOptions.companies.find(
                (c) => c.id === companyId
            );
            if (company && !filters.selectedCompanies.includes(companyId)) {
                chips.push({
                    id: `advanced-company-${company.id}`,
                    type: "company",
                    value: company.id,
                    display: company.name,
                });
            }
        });
    }

    // Advanced filters - Tags
    filters.advanced?.selectedTags?.forEach((tag) => {
        chips.push({ id: `tag-${tag}`, type: "tag", value: tag, display: tag });
    });

    return chips;
}
