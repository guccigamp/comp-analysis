/**
 * @file client-map-utils.js
 * @description Client-side utilities for Google Maps, particularly for Static Maps API.
 */

// Build a marker string for Google Static Maps using the markerApi endpoint for custom icons
export function buildMarker({
    latitude,
    longitude,
    color = "",
    logoURL = null,
    name = "",
}) {
    // Remove leading '#' if present so the backend can safely prepend its own '#'
    const sanitizedColor = color.startsWith("#") ? color.slice(1) : color;

    // Express endpoint that turns SVG → PNG for custom pins
    const markerUrl = `https://comp-analysis-xlky.onrender.com/api/markers?color=${sanitizedColor}${
        logoURL ? `&logoURL=${encodeURIComponent(logoURL)}` : ""
    }`;

    // Static Maps syntax:  markers=icon:URL|lat,lng
    return `icon:${markerUrl}|${latitude},${longitude}`;
}

export async function generateStaticMapUrl({
    center,
    zoom,
    facilities = [],
    size = "800x600",
    maptype = "roadmap",
    scale = 1,
}) {
    const apiKey =
        import.meta.env.VITE_GOOGLE_MAPS_STATIC_API ||
        import.meta.env.VITE_GOOGLE_MAPS_API;
    const mapId = import.meta.env.VITE_MAP_ID;

    if (!apiKey) {
        console.error(
            "Static Maps API key is missing. Please set VITE_GOOGLE_MAPS_STATIC_API or VITE_GOOGLE_MAPS_API."
        );
        return null;
    }

    const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
    const params = new URLSearchParams({
        key: apiKey,
        size,
        maptype,
        format: "png",
        scale: scale,
    });

    // Add markers for facilities
    const markerStrings = await Promise.all(facilities.map(buildMarker));
    markerStrings.forEach((m) => params.append("markers", m));

    params.append("center", `${center.lat},${center.lng}`);
    params.append("zoom", zoom.toString());

    if (mapId) {
        params.append("map_id", mapId);
    }

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Triggers a browser download for a given URL.
 * @param {string} url - The URL of the file to download.
 * @param {string} filename - The desired filename for the download.
 */
export async function downloadImage(url, filename = "map.png") {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                `Failed to fetch map image: ${response.statusText}`
            );
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(objectUrl);
    } catch (error) {
        console.error("Error downloading map image:", error);
        // You might want to show a user-facing error message here
        alert(`Could not download map: ${error.message}`);
    }
}
