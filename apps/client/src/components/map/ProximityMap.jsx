"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx"
import { facilityApi } from "../../lib/api.js"
import { transformFacilityData } from "../../utils/facility-utils.js"
import { useSearch } from "../../contexts/SearchContext.jsx"
import { InteractiveMap } from "./InteractiveMap.jsx"
import { FacilityCardList } from "./FacilityCardList.jsx"
import { FacilityCard } from "./FacilityCard.jsx"
import { buildApiFilters } from "../../utils/facility-utils.js"

export function ProximityMap({ centerFacility }) {
    const [nearbyFacilities, setNearbyFacilities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { filters } = useSearch()

    // Load nearby facilities when center facility changes
    useEffect(() => {
        const loadNearbyFacilities = async () => {
            if (!centerFacility || !filters.proximity?.enabled) {
                setNearbyFacilities([])
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)

                // Validate center facility coordinates
                if (!centerFacility.latitude || !centerFacility.longitude) {
                    throw new Error("Invalid facility coordinates")
                }

                // Call backend with the same filters but keeping proximity enabled
                const response = await facilityApi.getFilteredFacilities(
                    buildApiFilters(filters)
                )

                const facilitiesRaw = Array.isArray(response?.data) ? response.data : []
                const transformedFacilities = transformFacilityData(facilitiesRaw).filter(
                    (facility) => facility.id !== centerFacility.id,
                )

                setNearbyFacilities(transformedFacilities)
                setError(null)
            } catch (err) {
                console.error("Error loading nearby facilities:", err)
                setError(err.message || "Failed to load nearby facilities")
                setNearbyFacilities([])
            } finally {
                setLoading(false)
            }
        }

        loadNearbyFacilities()
    }, [centerFacility, filters])

    if (!centerFacility || !filters.proximity?.enabled) {
        return null
    }

    return (
        <Card className="mt-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                    Facilities within {filters.proximity.radius} {filters.proximity.unit} of selected location
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <FacilityCard facility={centerFacility} />
                    {/* Grid layout: list (left) | map (right) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Facilities list */}
                        <div className="md:col-span-1 order-2 md:order-1">
                            {nearbyFacilities.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    No other facilities found within {filters.proximity.radius} {filters.proximity.unit}.
                                </div>
                            ) : (
                                <div>

                                    <div className="overflow-y-auto md:h-[500px]">
                                        <FacilityCardList
                                            facilities={nearbyFacilities}
                                            onSelectFacility={() => { }}
                                            loading={loading}
                                            error={error}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Proximity map */}
                        <div className="md:col-span-3 order-1 md:order-2">
                            <InteractiveMap
                                facilities={[centerFacility, ...nearbyFacilities]}
                                center={{
                                    lat: centerFacility.latitude,
                                    lng: centerFacility.longitude,
                                }}
                                zoom={10}
                                height="500px"
                                loading={loading}
                                error={error}
                                showProximityCircle={true}
                                proximityCenter={{
                                    lat: centerFacility.latitude,
                                    lng: centerFacility.longitude,
                                }}
                                proximityRadius={filters.proximity.radius}
                                proximityUnit={filters.proximity.unit}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
