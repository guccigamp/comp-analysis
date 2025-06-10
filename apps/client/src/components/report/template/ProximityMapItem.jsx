import { Card, CardContent } from "../../ui/card.jsx"

export default function ProximityMapItem({ facility, index, proximityRadius, mapImage, facilityData }) {
  // Calculate facilities within proximity (simplified - in real app you'd use actual distance calculations)
  const facilitiesInRange = calculateFacilitiesInRange(facility, facilityData, proximityRadius)

  return (
    <div className="mb-6 proximity-map">
      <h3 className="text-lg font-semibold mb-2">
        4.{index + 1} {facility.facility_name || `Customer Facility #${index + 1}`} - Proximity Analysis
      </h3>
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="text-center">
            <img
              src={mapImage || "/proximity-map-customer.png"}
              alt={`${proximityRadius}-mile radius analysis for ${facility.facility_name}`}
              className="w-full max-w-3xl mx-auto rounded-lg border shadow-sm"
              style={{ maxHeight: "350px", objectFit: "contain" }}
            />
            <p className="text-sm text-gray-600 mt-2 italic">
              {proximityRadius}-mile radius analysis centered on{" "}
              {facility.facility_name || `Customer Facility #${index + 1}`}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-2 rounded">
              <p>
                <span className="font-semibold">Center:</span>
              </p>
              <p className="text-xs">{facility.facility_name || `Customer Facility #${index + 1}`}</p>
              <p className="text-xs">{facility.facility_type}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p>
                <span className="font-semibold">Analysis Radius:</span>
              </p>
              <p>{proximityRadius} miles</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p>
                <span className="font-semibold">Facilities in Range:</span>
              </p>
              <p>Altor: {facilitiesInRange.altor}</p>
              <p>Competitors: {facilitiesInRange.competitors}</p>
            </div>
          </div>
          {facility.facilities_address && (
            <div className="mt-2 text-xs text-gray-600">
              <span className="font-semibold">Address:</span> {facility.facilities_address}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to calculate facilities in range (simplified)
function calculateFacilitiesInRange(centerFacility, facilityData, radius) {
  // In a real application, you would use actual geographic coordinates and distance calculations
  // For now, we'll provide estimated counts based on the data structure
  return {
    altor: Math.floor(facilityData.altor * 0.3), // Simplified estimation
    competitors: Math.floor(facilityData.competitors * 0.2), // Simplified estimation
    total: Math.floor((facilityData.altor + facilityData.competitors) * 0.25),
  }
}
