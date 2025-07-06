import { useMemo } from "react"
import { Card, CardContent } from "../ui/card"

export function MapLegend({ facilities = [] }) {
    const companies = useMemo(() => {
        const companyMap = new Map()

        facilities.forEach((facility) => {
            if (facility.companyId && facility.companyName && facility.color) {
                companyMap.set(facility.companyId, {
                    id: facility.companyId,
                    name: facility.companyName,
                    color: facility.color,
                })
            }
        })

        return Array.from(companyMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [facilities])

    if (companies.length === 0) {
        return null
    }

    return (
        <Card className="absolute bottom-1 left-1 z-20 max-w-xs shadow-lg">
            <CardContent className="p-3">
                <h4 className="text-sm font-semibold mb-2 text-gray-700">Companies</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                    {companies.map((company) => (
                        <div key={company.id} className="flex items-center gap-2 text-xs">
                            <div
                                className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                style={{ backgroundColor: company.color }}
                            />
                            <span className="text-gray-700 truncate" title={company.name}>
                                {company.name}
                            </span>
                        </div>
                    ))}
                </div>
                {companies.length > 8 && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">{companies.length} companies total</div>
                )}
            </CardContent>
        </Card>
    )
}
