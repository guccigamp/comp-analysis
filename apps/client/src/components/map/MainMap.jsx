import { useState, useCallback } from "react"
import { useSearch } from "../../contexts/SearchContext"
import { FacilityCardList } from "./FacilityCardList"
import { InteractiveMap } from "./InteractiveMap"
import { ProximityMap } from "./ProximityMap"

export function MainMap() {
    const [selectedFacility, setSelectedFacility] = useState(null)
    const { filteredFacilities, filters, loading, error, refreshData, updateFilters } = useSearch()

    if (!filters) return null

    const handleMarkerClick = useCallback(
        (facility) => {
            if (!facility || typeof facility.latitude !== "number" || typeof facility.longitude !== "number") {
                console.error("Invalid facility data for marker click:", facility)
                return
            }
            setSelectedFacility(facility)
            updateFilters({
                proximity: {
                    ...filters.proximity,
                    center: {
                        latitude: facility.latitude,
                        longitude: facility.longitude,
                    },
                },
            })
        },
        [updateFilters, filters?.proximity],
    )

    const handleSelectFacility = useCallback(
        (facility) => handleMarkerClick(facility),
        [handleMarkerClick],
    )

    return (
        <>
            {/* Main grid: map (left) & facility list (right) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <InteractiveMap
                        facilities={filteredFacilities || []}
                        selectedFacility={selectedFacility}
                        loading={loading}
                        error={error}
                        onRetry={refreshData}
                        onMarkerClick={handleMarkerClick}
                        height="500px"
                    />
                </div>
                <FacilityCardList
                    facilities={filteredFacilities || []}
                    onSelectFacility={handleSelectFacility}
                    selectedFacilityId={selectedFacility?.id}
                    loading={loading}
                    error={error}
                    onRetry={refreshData}
                />
            </div>

            {/* Proximity map below the main grid to utilize full available width */}
            {selectedFacility && filters.proximity?.enabled && filters.proximity?.center && (
                <ProximityMap centerFacility={selectedFacility} />
            )}
        </>
    )
}
