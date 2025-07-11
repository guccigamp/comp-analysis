import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx"
import { facilityApi } from "../../lib/api.js"
import { transformFacilityData } from "../../utils/facility-utils.js"
import { useSearch } from "../../contexts/SearchContext.jsx"
import { InteractiveMap } from "./InteractiveMap.jsx"
import { FacilityCardList } from "./FacilityCardList.jsx"
import { FacilityCard } from "./FacilityCard.jsx"
import { buildApiFilters } from "../../utils/facility-utils.js"

export function ProximityMap({ centers = [], showAlert, showConfirm, onDeselectCenter = () => { } }) {
    const [nearbyFacilities, setNearbyFacilities] = useState([])
    // Map of center facility id -> nearby facilities for that center
    const [nearbyFacilitiesByCenter, setNearbyFacilitiesByCenter] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    // Map of centerId -> settings {radius, unit, circleColor, markerColor}
    const [centerSettings, setCenterSettings] = useState({})
    const { filters, updateFilters } = useSearch()

    // Enable proximity by default when component mounts
    useEffect(() => {
        if (!filters.proximity?.enabled) {
            updateFilters({
                proximity: {
                    enabled: true,
                    radius: 50,
                    unit: "miles"
                }
            })
        }
    }, [])

    // Ensure each selected center has default settings when centers change
    useEffect(() => {
        if (!centers || centers.length === 0) return
        setCenterSettings((prev) => {
            const updated = { ...prev }
            centers.forEach((c) => {
                if (!updated[c.id]) {
                    updated[c.id] = {
                        radius: filters.proximity?.radius ?? 50,
                        unit: filters.proximity?.unit ?? "miles",
                        color: "#4f46e5",
                    }
                }
            })
            // Remove settings for deselected centers
            Object.keys(updated).forEach((id) => {
                if (!centers.find((c) => String(c.id) === String(id))) {
                    delete updated[id]
                }
            })
            return updated
        })
    }, [centers, filters.proximity])

    // Load nearby facilities when center facility changes
    useEffect(() => {
        const loadNearbyFacilities = async () => {
            if (!centers || centers.length === 0 || !filters.proximity?.enabled) {
                setNearbyFacilities([])
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)

                // Validate center facility coordinates
                if (!centers.every(center => center.latitude && center.longitude)) {
                    throw new Error("Invalid facility coordinates")
                }

                const baseFilters = buildApiFilters({
                    ...filters,
                    proximity: {
                        ...filters.proximity,
                        enabled: false,
                    },
                })

                // Fetch facilities for all centers in parallel
                const results = await Promise.all(
                    centers.map(async (center) => {
                        const setting = centerSettings[center.id] || {
                            radius: filters.proximity.radius,
                            unit: filters.proximity.unit,
                        }

                        const apiFilters = {
                            ...baseFilters,
                            latitude: center.latitude,
                            longitude: center.longitude,
                            radius: setting.radius,
                            unit: setting.unit,
                        }

                        const response = await facilityApi.getFilteredFacilities(apiFilters)
                        const facilitiesRaw = Array.isArray(response?.data) ? response.data : []
                        const transformed = transformFacilityData(facilitiesRaw).filter((f) => f.id !== center.id)
                        return { centerId: center.id, facilities: transformed }
                    })
                )

                const newFacilitiesByCenter = {}
                const aggregated = results.flatMap((r) => {
                    newFacilitiesByCenter[r.centerId] = r.facilities
                    return r.facilities
                })

                // Deduplicate by facility id
                const deduped = Array.from(new Map(aggregated.map((f) => [f.id, f])).values())

                setNearbyFacilities(deduped)
                setNearbyFacilitiesByCenter(newFacilitiesByCenter)
                setError(null)

            } catch (err) {
                console.error("Error loading nearby facilities:", err)
                setError(err.message || "Failed to load nearby facilities")
                setNearbyFacilities([])
                showAlert?.({
                    variant: "destructive",
                    title: "Proximity Search Error",
                    message: err.message || "Failed to load nearby facilities"
                })
            } finally {
                setLoading(false)
            }
        }

        loadNearbyFacilities()
    }, [centers, filters, centerSettings, showAlert])

    // Default center coordinates (US center)
    const defaultCenter = {
        lat: 39.8283,
        lng: -98.5795
    }

    // Global toggle and radius/unit management removed; handled per facility via drawer

    const handleRetry = () => {
        showConfirm?.({
            title: "Retry Proximity Search",
            message: "This will reload the proximity search results. Continue?",
            onConfirm: () => {
                // Trigger a re-fetch by updating the filters
                updateFilters({
                    proximity: {
                        ...filters.proximity,
                        // Force update by changing a timestamp
                        lastUpdate: Date.now(),
                    },
                })
            },
        })
    }

    return (
        <Card className="mt-4">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                        Proximity Search
                    </CardTitle>



                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">

                    {/* Selected centers */}
                    {centers && centers.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {centers.map((center) => (
                                <FacilityCard
                                    key={center.id}
                                    facility={center}
                                    onDeselect={() => onDeselectCenter(center.id)}
                                    settings={centerSettings[center.id]}
                                    onSaveSettings={(id, newSettings) => {
                                        setCenterSettings((prev) => ({ ...prev, [id]: { ...prev[id], ...newSettings } }))
                                    }}
                                    showSettings
                                />
                            ))}
                        </div>
                    )}

                    {/* Layout: map (top) & facility list (bottom) */}
                    <div id="proximitymap" className="space-y-4">
                        {/* Map */}
                        <div className="relative">
                            <InteractiveMap
                                facilities={nearbyFacilities}
                                center={centers.length > 0 ? {
                                    lat: centers[0].latitude,
                                    lng: centers[0].longitude,
                                } : defaultCenter}
                                zoom={centers.length > 0 ? 5 : 4}
                                height="500px"
                                loading={loading}
                                error={error}
                                showProximityCircle={!!centers.length}
                                proximityCenters={centers}
                                proximityRadius={filters.proximity.radius}
                                proximityUnit={filters.proximity.unit}
                                centerSettings={centerSettings}
                                showAlert={showAlert}
                                onRetry={handleRetry}
                            />
                            {!centers.length && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
                                    <div className="bg-white/90 p-6 rounded-lg shadow-lg text-center max-w-md">
                                        <h3 className="text-lg font-semibold mb-2">Select a Facility</h3>
                                        <p className="text-muted-foreground">
                                            Choose a facility from the search results to view nearby locations within {filters.proximity.radius} {filters.proximity.unit}.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Facilities list */}
                        <div>
                            {centers.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    Select a facility to view nearby locations
                                </div>
                            ) : (
                                centers.map((center) => {
                                    const list = nearbyFacilitiesByCenter[center.id] || []
                                    return (
                                        <div key={center.id} className="mt-6 space-y-2">

                                            {list.length === 0 ? (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    No other facilities found within {centerSettings[center.id]?.radius ?? filters.proximity.radius} {centerSettings[center.id]?.unit ?? filters.proximity.unit}.
                                                </div>
                                            ) : (
                                                <div className="overflow-y-auto ">
                                                    <FacilityCardList
                                                        facilities={list}
                                                        onSelectFacility={() => { }}
                                                        loading={loading}
                                                        error={error}
                                                        onRetry={handleRetry}
                                                        showAlert={showAlert}
                                                        isProximity
                                                        label={`Facilities within ${centerSettings[center.id]?.radius ?? filters.proximity.radius} ${centerSettings[center.id]?.unit ?? filters.proximity.unit} of ${center.name || "selected location"}`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
