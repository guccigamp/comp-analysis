import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: "../../.env.local" });
// This file is now simplified - pin creation is handled by the Pin component
// Keep any other map-related utilities here if needed in the future

export function convertCoordinates(lat, lng) {
    return { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) };
}

export function calculateMapBounds(facilities) {
    if (!facilities || facilities.length === 0) return null;

    const bounds = {
        north: Math.max(...facilities.map((f) => f.latitude)),
        south: Math.min(...facilities.map((f) => f.latitude)),
        east: Math.max(...facilities.map((f) => f.longitude)),
        west: Math.min(...facilities.map((f) => f.longitude)),
    };

    return bounds;
}

// Build a marker string for Google Static Maps using the markerApi endpoint for custom icons
async function buildMarker({
    latitude,
    longitude,
    color = "red",
    logoURL = null,
    name = "",
}) {
    // Use your Express marker endpoint for custom PNG
    const markerUrl = `https://comp-analysis-xlky.onrender.com/api/markers?color=${color
        .toString()
        .slice(1)}${logoURL ? `&logoURL=${encodeURIComponent(logoURL)}` : ""}`;
    return `icon:${markerUrl}|${latitude},${longitude}`;
}

export async function buildStaticMap(
    center = { lat: 0, lng: 0 },
    facilities = [], // array of facility objects
    apiKey = process.env.VITE_GOOGLE_MAPS_STATIC_API,
    mapId = process.env.VITE_MAP_ID,
    zoom = 5,
    scale = 2,
    size = "1280x1280",
    maptype = "roadmap"
) {
    if (!apiKey) throw new Error("buildStaticMap: Missing Google Maps API key");

    const markerStrings = await Promise.all(facilities.map(buildMarker));

    const URL = "https://maps.googleapis.com/maps/api/staticmap?";
    const params = new URLSearchParams({
        key: apiKey,
        center: `${center.lat},${center.lng}`,
        zoom,
        size,
        maptype,
        format: "gif",
        scale,
        // turn off POI labels for cleaner report
        // style: "feature:all|element:labels|visibility:off",
    });

    markerStrings.forEach((m) => params.append("markers", m));

    if (mapId) params.append("map_id", mapId);

    return `${URL}${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Simple CLI test:  node map-utils.js  (only when run directly)
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const demoFacilities = [
            // Altor Solutions
            {
                id: "fac1",
                companyId: "comp1",
                companyName: "Altor Solutions",
                address: "123 Main St, Springfield, IL 62701",
                state: "IL",
                city: "Springfield",
                latitude: 39.7817,
                longitude: -89.6501,
                color: "#FF5733",
                name: "Springfield Plant",
                zipCode: "62701",
                active: true,
                created_at: "2023-01-15T10:00:00Z",
                updated_at: "2024-05-20T12:00:00Z",
            },
            {
                id: "fac2",
                companyId: "comp1",
                companyName: "Altor Solutions",
                address: "200 River Rd, Peoria, IL 61602",
                state: "IL",
                city: "Peoria",
                latitude: 40.6936,
                longitude: -89.589,
                color: "#FF5733",
                name: "Peoria Warehouse",
                zipCode: "61602",
                active: true,
                created_at: "2023-03-10T11:00:00Z",
                updated_at: "2024-05-21T09:00:00Z",
            },

            // Acme Corp
            {
                id: "fac3",
                companyId: "comp2",
                companyName: "Acme Corp",
                address: "456 Elm St, Dallas, TX 75201",
                state: "TX",
                city: "Dallas",
                latitude: 32.7767,
                longitude: -96.797,
                color: "#4287f5",
                name: "Dallas Distribution",
                zipCode: "75201",
                active: true,
                created_at: "2022-11-10T09:30:00Z",
                updated_at: "2024-05-18T15:45:00Z",
            },
            {
                id: "fac4",
                companyId: "comp2",
                companyName: "Acme Corp",
                address: "789 Maple Ave, Houston, TX 77002",
                state: "TX",
                city: "Houston",
                latitude: 29.7604,
                longitude: -95.3698,
                color: "#4287f5",
                name: "Houston Plant",
                zipCode: "77002",
                active: true,
                created_at: "2022-12-05T08:15:00Z",
                updated_at: "2024-05-19T10:20:00Z",
            },

            // Beta Industries
            {
                id: "fac5",
                companyId: "comp3",
                companyName: "Beta Industries",
                address: "789 Oak Ave, Atlanta, GA 30303",
                state: "GA",
                city: "Atlanta",
                latitude: 33.749,
                longitude: -84.388,
                color: "#34a853",
                name: "Atlanta Hub",
                zipCode: "30303",
                active: false,
                created_at: "2021-07-22T14:20:00Z",
                updated_at: "2023-12-01T08:10:00Z",
            },
            {
                id: "fac6",
                companyId: "comp3",
                companyName: "Beta Industries",
                address: "321 Pine St, Savannah, GA 31401",
                state: "GA",
                city: "Savannah",
                latitude: 32.0809,
                longitude: -81.0912,
                color: "#34a853",
                name: "Savannah Depot",
                zipCode: "31401",
                active: true,
                created_at: "2021-09-10T13:00:00Z",
                updated_at: "2024-05-15T11:30:00Z",
            },
        ];

        const url = await buildStaticMap(
            { lat: 39.8282, lng: -98.5795 },
            demoFacilities,
            process.env.VITE_GOOGLE_MAPS_STATIC_API,
            process.env.VITE_MAP_ID,
            4,
            1,
            "1280x1280",
            "roadmap"
        );
        console.log(url);
        fetch(url)
            .then((res) => res.arrayBuffer())
            .then((buffer) =>
                fs.writeFileSync("output.png", Buffer.from(buffer))
            );
    })();
}
