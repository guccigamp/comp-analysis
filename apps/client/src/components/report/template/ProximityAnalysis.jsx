import ProximityMapItem from "./ProximityMapItem.jsx"

export default function ProximityAnalysis({ customerName, proximityRadius, facilityData, mapImage }) {
  return (
    <section className="mb-8 page-break">
      <h2 className="text-2xl font-bold mb-3 text-black border-l-4 border-black pl-3">4. Proximity Analysis</h2>
      <div className="mb-4 bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm leading-relaxed">
          <span className="font-semibold">Analysis Scope:</span> Each of the{" "}
          {facilityData.featuredCompanyFacilities.length} {customerName} facilities analyzed within {proximityRadius}
          -mile radius. This extended range captures regional distribution opportunities and identifies optimal
          packaging consolidation points for cost-effective logistics solutions.
        </p>
        {facilityData.competitors > 0 && (
          <p className="text-sm leading-relaxed mt-2">
            <span className="font-semibold">Competitive Landscape:</span> Analysis includes {facilityData.competitors}{" "}
            competitor facilities from {facilityData.competitorCompanies.length} companies to provide comprehensive
            market context.
          </p>
        )}
      </div>
      {facilityData.featuredCompanyFacilities.map((facility, index) => (
        <ProximityMapItem
          key={index}
          facility={facility}
          index={index}
          proximityRadius={proximityRadius}
          mapImage={mapImage}
          facilityData={facilityData}
        />
      ))}
    </section>
  )
}
