export default function CustomerInfo({ customerName, proximityRadius, facilityData }) {
  return (
    <div className="mb-6 border-b border-gray-200 pb-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm uppercase text-gray-500 font-medium">Prepared For</h2>
          <p className="text-xl font-bold">{customerName}</p>
        </div>
        <div>
          <h2 className="text-sm uppercase text-gray-500 font-medium">Analysis Parameters</h2>
          <p>
            <span className="font-medium">Proximity Radius:</span> {proximityRadius} miles
          </p>
          <p>
            <span className="font-medium">Customer Facilities:</span> {facilityData.novatech}
          </p>
          <p>
            <span className="font-medium">Geographic Coverage:</span> {Object.keys(facilityData.states).length} states,{" "}
            {Object.keys(facilityData.cities).length} cities
          </p>
        </div>
      </div>
    </div>
  )
}
