import { Card, CardContent } from "@/components/ui/card"

export default function FacilityMapCard({ title, imageUrl, imageAlt, caption, analytics, companyType, legendData }) {
  return (
    <section className="mb-8 map-section page-break">
      <h2 className="text-2xl font-bold mb-3 text-black border-l-4 border-black pl-3">{title}</h2>
      {analytics && (
        <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
          {companyType === "Altor" && (
            <>
              <div className="bg-blue-50 p-3 rounded">
                <p>
                  <span className="font-semibold">Total Facilities:</span> {analytics.totalFacilities}
                </p>
                <p>
                  <span className="font-semibold">Geographic Spread:</span> {analytics.geographicSpread} states
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <p>
                  <span className="font-semibold">Top Cities:</span>
                </p>
                {analytics.topCities.map(([city, data]) => (
                  <p key={city} className="text-xs">
                    • {city}: {data.altor}
                  </p>
                ))}
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <p>
                  <span className="font-semibold">Facility Types:</span>
                </p>
                {analytics.facilityTypes.map(([type, data]) => (
                  <p key={type} className="text-xs">
                    • {type}: {data.altor}
                  </p>
                ))}
              </div>
            </>
          )}
          {companyType === "Customer" && (
            <>
              <div className="bg-green-50 p-3 rounded">
                <p>
                  <span className="font-semibold">Total Facilities:</span> {analytics.totalFacilities}
                </p>
                <p>
                  <span className="font-semibold">Geographic Spread:</span> {analytics.geographicSpread} states
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p>
                  <span className="font-semibold">Top Cities:</span>
                </p>
                {analytics.topCities.map(([city, data]) => (
                  <p key={city} className="text-xs">
                    • {city}: {data.featured}
                  </p>
                ))}
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p>
                  <span className="font-semibold">Primary Types:</span>
                </p>
                {analytics.facilityTypes.map(([type, data]) => (
                  <p key={type} className="text-xs">
                    • {type}: {data.featured}
                  </p>
                ))}
              </div>
            </>
          )}
          {companyType === "Combined" && (
            <div className="col-span-3 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p>
                    <span className="font-semibold">Market Overlap:</span>
                  </p>
                  <p>{analytics.sharedStatesCount} shared states</p>
                  <p>{analytics.sharedCitiesCount} shared cities</p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Coverage Density:</span>
                  </p>
                  <p>{analytics.coverageDensityStates} per state</p>
                  <p>{analytics.coverageDensityCities} per city</p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Top Markets:</span>
                  </p>
                  <p>
                    {analytics.topStatesCombined[0]?.[0]}: {analytics.topStatesCombined[0]?.[1]?.total}
                  </p>
                  <p>
                    {analytics.topCitiesCombined[0]?.[0]}: {analytics.topCitiesCombined[0]?.[1]?.total}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Competitive Context:</span>
                  </p>
                  <p>Competitor overlap: {analytics.competitorOverlap?.competitorStates || 0} states</p>
                  <p>Market positioning: Optimal</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="text-center">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={imageAlt}
              className="w-full max-w-4xl mx-auto rounded-lg border shadow-sm"
              style={{ maxHeight: "450px", objectFit: "contain" }}
            />
            <p className="text-sm text-gray-600 mt-2 italic">{caption}</p>
          </div>
          {legendData && (
            <div className="flex justify-center mt-3">
              <div className="flex space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-black rounded-full mr-2"></div>
                  <span>Altor ({legendData.altorCount})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  <span>
                    {legendData.customerName} ({legendData.customerCount})
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
