export default async function getAddressFromCoordinates(lat, lng, apiKey) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.status === "OK") {
        // You can return the formatted address of the first result
        return data.results[0]?.formatted_address || "No address found";
      } else {
        throw new Error(`Geocoding API error: ${data.status}`);
      }
    } catch (error) {
      console.error("Error fetching geocoding data:", error);
      return null;
    }
  }

  // Example usage:

//   getAddressFromCoordinates(40.714224, -73.961452, apiKey)
//   .then(address => console.log("Address:", address));
  