function parseAddressComponents(components) {
/*
{
   "results" : [
      {
         "address_components" : [
            {
               "long_name" : "277",
               "short_name" : "277",
               "types" : [ "street_number" ]
            },
            {
               "long_name" : "Bedford Avenue",
               "short_name" : "Bedford Ave",
               "types" : [ "route" ]
            },
            {
               "long_name" : "Williamsburg",
               "short_name" : "Williamsburg",
               "types" : [ "neighborhood", "political" ]
            },
            {
               "long_name" : "Brooklyn",
               "short_name" : "Brooklyn",
               "types" : [ "sublocality", "political" ]
            },
            {
               "long_name" : "Kings",
               "short_name" : "Kings",
               "types" : [ "administrative_area_level_2", "political" ]
            },
            {
               "long_name" : "New York",
               "short_name" : "NY",
               "types" : [ "administrative_area_level_1", "political" ]
            },
            {
               "long_name" : "United States",
               "short_name" : "US",
               "types" : [ "country", "political" ]
            },
            {
               "long_name" : "11211",
               "short_name" : "11211",
               "types" : [ "postal_code" ]
            }
         ],
         "formatted_address" : "277 Bedford Avenue, Brooklyn, NY 11211, USA",
         "geometry" : {
            "location" : {
               "lat" : 40.714232,
               "lng" : -73.9612889
            },
            "location_type" : "ROOFTOP",
            "viewport" : {
               "northeast" : {
                  "lat" : 40.7155809802915,
                  "lng" : -73.9599399197085
               },
               "southwest" : {
                  "lat" : 40.7128830197085,
                  "lng" : -73.96263788029151
               }
            }
         },
         "place_id" : "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
         "types" : [ "street_address" ]
      },

*/

    let address = "";
    let state = "";

    address = components.formatted_address || "";

    state = components.address_components.find(comp => comp.types.includes("administrative_area_level_1"))?.short_name || "";
    

    return { address, state };
}

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
            const result = data.results[0];
            // console.log(result)
            return parseAddressComponents(result);
        } else {
            throw new Error(`Geocoding API error: ${data.status}`);
        }
    } catch (error) {
        console.error("Error fetching geocoding data:", error);
        return null;
    }
}

// Example usage:

// getAddressFromCoordinates(
//     40.714224,
//     -73.961452,
//     process.env.GEOCODING_API_KEY
// ).then((address) => console.log("Address:", address));
