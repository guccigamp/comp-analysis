/**
 * Convert latitude and longitude to GeoJSON Point
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Object} GeoJSON Point object
 */
export const createGeoJSONPoint = (latitude, longitude) => {
    return {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON uses [longitude, latitude] order
    };
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @param {string} unit - Unit of measurement ('miles' or 'kilometers')
 * @returns {number} Distance between points in specified unit
 */
export const calculateDistance = (lat1, lon1, lat2, lon2, unit = "miles") => {
    const R = unit === "kilometers" ? 6371 : 3959; // Earth radius in km or miles

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Extract city from address string
 * @param {string} address - Full address string
 * @returns {string} City name
 */
export const extractCityFromAddress = (address) => {
    const parts = address.split(",").map((part) => part.trim());
    if (parts.length >= 2) {
        const cityPart = parts[parts.length - 2];
        return cityPart.replace(/\d+.*$/, "").trim();
    }
    return "";
};
