// Calculate distance between two points using Haversine formula
export function calculateDistance(point1, point2) {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(point2.latitude - point1.latitude)
  const dLon = toRadians(point2.longitude - point1.longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in miles
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

// Convert miles to kilometers
export function milesToKilometers(miles) {
  return miles * 1.60934
}

// Convert kilometers to miles
export function kilometersToMiles(kilometers) {
  return kilometers / 1.60934
}

// Geocode an address using Google Maps Geocoding API
export async function geocodeAddress(address, apiKey) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`,
    )
    const data = await response.json()

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return {
        latitude: location.lat,
        longitude: location.lng,
      }
    } else if (data.status === "ZERO_RESULTS") {
      console.warn("No results found for address:", address)
      return null
    } else if (data.status === "OVER_QUERY_LIMIT") {
      console.error("Google Maps API quota exceeded")
      throw new Error("API quota exceeded. Please try again later.")
    } else if (data.status === "REQUEST_DENIED") {
      console.error("Google Maps API request denied:", data.error_message)
      throw new Error("API access denied. Please check your API key.")
    } else {
      console.error("Geocoding failed:", data.status, data.error_message)
      throw new Error(`Geocoding failed: ${data.status}`)
    }
  } catch (error) {
    console.error("Geocoding error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to geocode address")
  }
}

// Get user's current location
export function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        console.error("Geolocation error:", error)
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  })
}

// Format coordinates for display
export function formatCoordinates(coordinates) {
  return `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
}

// Validate coordinates
export function isValidCoordinates(coordinates) {
  return (
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  )
}
