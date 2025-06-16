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
import { Button } from "../ui/button.jsx"
import { MapPin, Settings } from "lucide-react"

export function ProximityMap({ centerFacility }) {
    const [nearbyFacilities, setNearbyFacilities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [proximityRadius, setProximityRadius] = useState("50")
    const [proximityUnit, setProximityUnit] = useState("miles")
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

    // Sync local state with context when filters change
    useEffect(() => {
        setProximityRadius(String(filters.proximity.radius))
        setProximityUnit(filters.proximity.unit)
    }, [filters.proximity.radius, filters.proximity.unit])

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

                // Create filters that include both proximity and other filters
                const apiFilters = {
                    ...buildApiFilters(filters),
                    latitude: centerFacility.latitude,
                    longitude: centerFacility.longitude,
                    radius: filters.proximity.radius,
                    unit: filters.proximity.unit
                }

                // Call backend with combined filters
                const response = await facilityApi.getFilteredFacilities(apiFilters)

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

    // Default center coordinates (US center)
    const defaultCenter = {
        lat: 39.8283,
        lng: -98.5795
    }

    const handleProximityToggle = () => {
        updateFilters({
            proximity: {
                ...filters.proximity,
                enabled: !filters.proximity.enabled,
                radius: Number(proximityRadius),
                unit: proximityUnit,
            },
        })
    }

    const commitRadius = () => {
        const num = Number(proximityRadius)
        if (isNaN(num) || num < 1 || num > 1000) return
        updateFilters({
            proximity: {
                ...filters.proximity,
                radius: num,
            },
        })
    }

    const handleUnitChange = (value) => {
        setProximityUnit(value)
        if (filters.proximity.enabled) {
            updateFilters({
                proximity: {
                    ...filters.proximity,
                    unit: value,
                },
            })
        }
    }

    return (
        <Card className="mt-4">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                        {centerFacility
                            ? `Facilities within ${filters.proximity.radius} ${filters.proximity.unit} of selected location`
                            : "Proximity Search"}
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isSettingsOpen && (
                        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium text-sm">Enable Proximity Search</div>
                                    <div className="text-xs text-muted-foreground">Show nearby facilities when selecting a location</div>
                                </div>
                                <button
                                    onClick={handleProximityToggle}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${filters.proximity.enabled ? "bg-primary" : "bg-gray-200"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.proximity.enabled ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="radius" className="text-sm font-medium">
                                        Search Radius
                                    </label>
                                    <input
                                        id="radius"
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={proximityRadius}
                                        onChange={(e) => setProximityRadius(e.target.value)}
                                        onBlur={commitRadius}
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="unit" className="text-sm font-medium">
                                        Unit
                                    </label>
                                    <select
                                        id="unit"
                                        className="w-full p-2 border rounded-md text-sm"
                                        value={proximityUnit}
                                        onChange={(e) => handleUnitChange(e.target.value)}
                                    >
                                        <option value="miles">Miles</option>
                                        <option value="kilometers">Kilometers</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {centerFacility && <FacilityCard facility={centerFacility} />}

                    {/* Grid layout: list (left) | map (right) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Facilities list */}
                        <div className="md:col-span-1 order-2 md:order-1">
                            {!centerFacility ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    Select a facility to view nearby locations
                                </div>
                            ) : nearbyFacilities.length === 0 ? (
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
                                            isProximity
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Proximity map */}
                        <div className="md:col-span-3 order-1 md:order-2 relative">
                            <InteractiveMap
                                facilities={centerFacility ? [centerFacility, ...nearbyFacilities] : []}
                                center={centerFacility ? {
                                    lat: centerFacility.latitude,
                                    lng: centerFacility.longitude,
                                } : defaultCenter}
                                zoom={centerFacility ? 5 : 4}
                                height="500px"
                                loading={loading}
                                error={error}
                                showProximityCircle={!!centerFacility}
                                proximityCenter={centerFacility ? {
                                    lat: centerFacility.latitude,
                                    lng: centerFacility.longitude,
                                } : null}
                                proximityRadius={filters.proximity.radius}
                                proximityUnit={filters.proximity.unit}
                            />
                            {!centerFacility && (
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
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
