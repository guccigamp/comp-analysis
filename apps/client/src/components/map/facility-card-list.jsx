import { Card } from "../ui/card"
import { Building, MapPin } from "lucide-react"

export function FacilityCardList({ facilities, onSelectFacility, selectedFacilityId }) {
  return (
    <div className="border rounded-lg p-4 h-[500px] overflow-y-auto">
      <h3 className="font-medium mb-3">Facilities ({facilities.length})</h3>

      {facilities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No facilities match your search criteria</div>
      ) : (
        <div className="space-y-3">
          {facilities.map((facility) => (
            <Card
              key={facility.id}
              className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${selectedFacilityId === facility.id ? "ring-2 ring-primary" : ""
                }`}
              onClick={() => onSelectFacility(facility)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full mt-1" style={{ backgroundColor: `${facility.color}20` }}>
                  <Building className="h-4 w-4" style={{ color: facility.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{facility.companyName}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{facility.address}</span>
                  </div>
                  <div className="mt-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${facility.color}20`,
                        color: facility.color,
                      }}
                    >
                      {facility.state}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
