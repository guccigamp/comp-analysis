export default function ExecutiveSummary({ customerName, proximityRadius, facilityData }) {
  const avgFacilitiesInRange =
    facilityData.novatech > 0 ? Math.round((facilityData.total / facilityData.novatech) * 10) / 10 : 0
  const topStates = Object.entries(facilityData.states)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 1)
  const topCities = Object.entries(facilityData.cities)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 1)

  return (
    <section className="mb-8 keep-together">
      <h2 className="text-2xl font-bold mb-3 text-black border-l-4 border-black pl-3">Executive Summary</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="leading-relaxed mb-3">
          This comprehensive analysis examines the strategic positioning of {facilityData.altor} Altor facilities and{" "}
          {facilityData.novatech} {customerName} facilities across {Object.keys(facilityData.states).length} states and{" "}
          {Object.keys(facilityData.cities).length} cities. Our analysis reveals significant opportunities for optimized
          distribution networks within the {proximityRadius}-mile service radius.
        </p>
        <p className="leading-relaxed">
          Key findings indicate that {topStates[0]?.[0] || "multiple states"} leads with{" "}
          {topStates[0]?.[1]?.total || "several"} facilities, while {topCities[0]?.[0] || "major cities"} serves as the
          primary urban hub with {topCities[0]?.[1]?.total || "multiple"} facilities. Our proximity analysis shows an
          average of {avgFacilitiesInRange} facilities within range of each customer location, enabling efficient
          packaging and distribution solutions.
        </p>
      </div>
    </section>
  )
}
