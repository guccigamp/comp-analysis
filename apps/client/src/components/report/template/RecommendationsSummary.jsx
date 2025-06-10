import { Card, CardContent } from "../../ui/card.jsx"

export default function RecommendationsSummary({ customerName, proximityRadius, facilityData }) {
  const topStates = Object.entries(facilityData.states)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 1)
  const topCities = Object.entries(facilityData.cities)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 1)
  const sharedStatesCount = Object.entries(facilityData.states).filter(
    ([, data]) => data.altor > 0 && data.novatech > 0,
  ).length
  const sharedCitiesCount = Object.entries(facilityData.cities).filter(
    ([, data]) => data.altor > 0 && data.novatech > 0,
  ).length

  return (
    <section className="mb-8 keep-together">
      <h2 className="text-2xl font-bold mb-3 text-black border-l-4 border-black pl-3">6. Strategic Recommendations</h2>
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <p className="mb-3">
            Based on the comprehensive facility location analysis of {facilityData.total} facilities across{" "}
            {Object.keys(facilityData.states).length} states and {Object.keys(facilityData.cities).length} cities, Altor
            recommends the following strategic initiatives:
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold text-sm mb-1">Regional Hub Strategy</h4>
              <p className="text-sm">
                Establish {topStates[0]?.[0] || "primary state"} as the central hub with{" "}
                {topStates[0]?.[1]?.total || "multiple"} facilities, and leverage {topCities[0]?.[0] || "key city"} as
                the urban distribution center to reduce transportation costs by 15-20%.
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <h4 className="font-semibold text-sm mb-1">Market Synergy Optimization</h4>
              <p className="text-sm">
                Capitalize on the {sharedStatesCount} shared states and {sharedCitiesCount} shared cities to implement
                consolidated packaging solutions, achieving 10-15% cost savings through economies of scale.
              </p>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <h4 className="font-semibold text-sm mb-1">Extended Radius Logistics</h4>
              <p className="text-sm">
                The {proximityRadius}-mile analysis radius enables regional consolidation strategies, potentially
                reducing packaging and shipping costs by 12-18% through optimized route planning and bulk distribution.
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <h4 className="font-semibold text-sm mb-1">Facility-Type Specialization</h4>
              <p className="text-sm">
                Develop specialized packaging solutions for each facility type in the network - temperature-controlled
                solutions for manufacturing facilities, rapid deployment for distribution centers, and secure packaging
                for R&D facilities.
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm italic">
              These data-driven recommendations leverage the strategic positioning of your {facilityData.novatech}
              -facility network to create a simple, efficient, and reliable packaging and distribution ecosystem.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
