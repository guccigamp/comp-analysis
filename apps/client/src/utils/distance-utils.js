// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(coord1, coord2) {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const lat1 = toRad(coord1.latitude);
    const lat2 = toRad(coord2.latitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) *
            Math.sin(dLon / 2) *
            Math.cos(lat1) *
            Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

// Convert degrees to radians
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Convert miles to kilometers
export function milesToKilometers(miles) {
    return miles * 1.60934;
}

// Convert kilometers to miles
export function kilometersToMiles(kilometers) {
    return kilometers * 0.621371;
}
