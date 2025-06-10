import { Card, CardContent } from "../../ui/card.jsx"

export default function StatisticsSummary({ customerName, facilityData }) {
  const topStates = Object.entries(facilityData.states)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 3)
  const topCities = Object.entries(facilityData.cities)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5)
  const sharedStatesCount = Object.entries(facilityData.states).filter(
    ([, data]) => data.altor > 0 && data.featured > 0,
  ).length
  const sharedCitiesCount = Object.entries(facilityData.cities).filter(
    ([, data]) => data.altor > 0 && data.featured > 0,
  ).length

  return (
    <section className="mb-8 keep-together page-break">
      <h2 className="text-2xl font-bold mb-3 text-black border-l-4 border-black pl-3">5. Summary Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 border-b pb-2">Network Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Altor Facilities:</span>
                <span className="font-semibold">{facilityData.altor}</span>
              </div>
              <div className="flex justify-between">
                <span>{customerName} Facilities:</span>
                <span className="font-semibold">{facilityData.featured}</span>
              </div>
              <div className="flex justify-between">
                <span>Competitor Facilities:</span>
                <span className="font-semibold">{facilityData.competitors}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total Network Facilities:</span>
                <span className="font-semibold">{facilityData.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 border-b pb-2">Geographic Coverage</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>States Covered:</span>
                <span className="font-semibold">{Object.keys(facilityData.states).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Cities Covered:</span>
                <span className="font-semibold">{Object.keys(facilityData.cities).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Shared Markets:</span>
                <span className="font-semibold">
                  {sharedStatesCount} states, {sharedCitiesCount} cities
                </span>
              </div>
              <div className="flex justify-between">
                <span>Competitor Companies:</span>
                <span className="font-semibold">{facilityData.competitorCompanies.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">Top States by Facility Count</h3>
            <div className="space-y-2">
              {topStates.map(([state, counts], index) => (
                <div key={state} className="flex justify-between text-sm">
                  <span>
                    {index + 1}. {state}
                  </span>
                  <span className="font-medium">
                    {counts.total} (A:{counts.altor}, {customerName.split(" ")[0]}:{counts.featured}, C:
                    {Object.values(counts.competitors || {}).reduce((sum, val) => sum + val, 0)})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">Top Cities by Facility Count</h3>
            <div className="space-y-2">
              {topCities.map(([city, counts], index) => (
                <div key={city} className="flex justify-between text-sm">
                  <span>
                    {index + 1}. {city}
                  </span>
                  <span className="font-medium">
                    {counts.total} (A:{counts.altor}, {customerName.split(" ")[0]}:{counts.featured}, C:
                    {Object.values(counts.competitors || {}).reduce((sum, val) => sum + val, 0)})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-3 border-b pb-2">Facility Type Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(facilityData.facilityTypes).map(([type, counts]) => (
              <div key={type} className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-sm">{type}</p>
                <div className="text-xs mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span>Altor:</span>
                    <span>{counts.altor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{customerName}:</span>
                    <span>{counts.featured}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Competitors:</span>
                    <span>{Object.values(counts.competitors || {}).reduce((sum, val) => sum + val, 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total:</span>
                    <span>{counts.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
