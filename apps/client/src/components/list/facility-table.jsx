import { ChevronDown, ChevronUp, MapPin } from "lucide-react"

export function FacilityTable({ facilities, sortField, sortDirection, onSort }) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 cursor-pointer" onClick={() => onSort("companyName")}>
              <div className="flex items-center">
                Company
                {sortField === "companyName" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </th>
            <th className="text-left p-4 cursor-pointer" onClick={() => onSort("address")}>
              <div className="flex items-center">
                Address
                {sortField === "address" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </th>
            <th className="text-left p-4 cursor-pointer" onClick={() => onSort("state")}>
              <div className="flex items-center">
                State
                {sortField === "state" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </th>
            <th className="text-right p-4">Coordinates</th>
          </tr>
        </thead>
        <tbody>
          {facilities.length === 0 ? (
            <tr>
              <td colSpan={4} className="h-24 text-center p-4">
                No facilities found.
              </td>
            </tr>
          ) : (
            facilities.map((facility) => (
              <tr key={facility.id} className="border-b">
                <td className="p-4 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: facility.color }} />
                    {facility.companyName}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {facility.address}
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    {facility.state}
                  </span>
                </td>
                <td className="p-4 text-right font-mono text-xs">
                  {facility.latitude.toFixed(4)}, {facility.longitude.toFixed(4)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
