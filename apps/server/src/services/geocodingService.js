import dotenv from "dotenv";

dotenv.config();

class GeocodingService {
    constructor() {
        this.apiKey = process.env.GEOCODING_API_KEY;
        this.baseUrl = "https://maps.googleapis.com/maps/api";

        if (!this.apiKey) {
            throw new Error(
                "GEOCODING_API_KEY environment variable is required"
            );
        }
    }

    /**
     * Geocode an address to get coordinates and location details
     * @param {string} address - Full address string
     * @returns {Object} Location data with coordinates and address components
     */
    async geocodeAddress(address) {
        try {
            const encodedAddress = encodeURIComponent(address);
            const url = `${this.baseUrl}/geocode/json?address=${encodedAddress}&key=${this.apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== "OK") {
                throw new Error(
                    `Geocoding API error: ${data.status} - ${
                        data.error_message || "Unknown error"
                    }`
                );
            }

            if (data.results.length === 0) {
                throw new Error(`No results found for address: ${address}`);
            }

            const result = data.results[0];
            const location = result.geometry.location;
            const addressComponents = result.address_components;

            // Extract address components
            const getComponent = (types) => {
                const component = addressComponents.find((comp) =>
                    types.some((type) => comp.types.includes(type))
                );
                return component ? component.long_name : "";
            };

            const getShortComponent = (types) => {
                const component = addressComponents.find((comp) =>
                    types.some((type) => comp.types.includes(type))
                );
                return component ? component.short_name : "";
            };

            return {
                coordinates: [location.lng, location.lat], // GeoJSON format [longitude, latitude]
                address: result.formatted_address,
                city: getComponent(["locality", "administrative_area_level_2"]),
                state: getShortComponent(["administrative_area_level_1"]),
                zipCode: getComponent(["postal_code"]),
                country: getShortComponent(["country"]),
            };
        } catch (error) {
            console.error("Geocoding error:", error.message);
            throw new Error(
                `Failed to geocode address: ${address} - ${error.message}`
            );
        }
    }

    /**
     * Reverse geocode coordinates to get address and location details
     * @param {number} latitude - Latitude coordinate
     * @param {number} longitude - Longitude coordinate
     * @returns {Object} Location data with address and address components
     */
    async reverseGeocode(latitude, longitude) {
        try {
            const url = `${this.baseUrl}/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== "OK") {
                throw new Error(
                    `Reverse geocoding API error: ${data.status} - ${
                        data.error_message || "Unknown error"
                    }`
                );
            }

            if (data.results.length === 0) {
                throw new Error(
                    `No results found for coordinates: ${latitude}, ${longitude}`
                );
            }

            const result = data.results[0];
            const addressComponents = result.address_components;

            // Extract address components
            const getComponent = (types) => {
                const component = addressComponents.find((comp) =>
                    types.some((type) => comp.types.includes(type))
                );
                return component ? component.long_name : "";
            };

            const getShortComponent = (types) => {
                const component = addressComponents.find((comp) =>
                    types.some((type) => comp.types.includes(type))
                );
                return component ? component.short_name : "";
            };

            return {
                coordinates: [longitude, latitude], // GeoJSON format [longitude, latitude]
                address: result.formatted_address,
                city: getComponent(["locality", "administrative_area_level_2"]),
                state: getShortComponent(["administrative_area_level_1"]),
                zipCode: getComponent(["postal_code"]),
                country: getShortComponent(["country"]),
            };
        } catch (error) {
            console.error("Reverse geocoding error:", error.message);
            throw new Error(
                `Failed to reverse geocode coordinates: ${latitude}, ${longitude} - ${error.message}`
            );
        }
    }

    /**
     * Add delay between API calls to respect rate limits
     * @param {number} ms - Milliseconds to delay
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Batch geocode multiple addresses with rate limiting
     * @param {Array} addresses - Array of address strings
     * @param {number} delayMs - Delay between requests in milliseconds
     * @returns {Array} Array of geocoded results
     */
    async batchGeocodeAddresses(addresses, delayMs = 100) {
        const results = [];

        for (let i = 0; i < addresses.length; i++) {
            try {
                const result = await this.geocodeAddress(addresses[i]);
                results.push({
                    success: true,
                    data: result,
                    originalAddress: addresses[i],
                });
            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    originalAddress: addresses[i],
                });
            }

            // Add delay between requests except for the last one
            if (i < addresses.length - 1) {
                await this.delay(delayMs);
            }
        }

        return results;
    }

    /**
     * Batch reverse geocode multiple coordinate pairs with rate limiting
     * @param {Array} coordinates - Array of [latitude, longitude] pairs
     * @param {number} delayMs - Delay between requests in milliseconds
     * @returns {Array} Array of reverse geocoded results
     */
    async batchReverseGeocode(coordinates, delayMs = 100) {
        const results = [];

        for (let i = 0; i < coordinates.length; i++) {
            const [lat, lng] = coordinates[i];
            try {
                const result = await this.reverseGeocode(lat, lng);
                results.push({
                    success: true,
                    data: result,
                    originalCoordinates: [lat, lng],
                });
            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    originalCoordinates: [lat, lng],
                });
            }

            // Add delay between requests except for the last one
            if (i < coordinates.length - 1) {
                await this.delay(delayMs);
            }
        }

        return results;
    }
}

export default new GeocodingService();
