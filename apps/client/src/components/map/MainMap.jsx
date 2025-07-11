import { useState, useCallback } from "react"
import { useSearch } from "../../contexts/SearchContext.jsx"
import { FacilityCardList } from "./FacilityCardList.jsx"
import { InteractiveMap } from "./InteractiveMap.jsx"
import { ProximityMap } from "./ProximityMap.jsx"

export function MainMap({ showAlert, showConfirm }) {
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

    const handleMapError = useCallback(
        (errorMessage) => {
            showAlert({
                variant: "destructive",
                title: "Map Error",
                message: errorMessage || "An error occurred while loading the map",
            })
        },
        [showAlert],
    )

    const handleRetry = useCallback(() => {
        showConfirm({
            title: "Refresh Data",
            message: "This will reload all facility data. Continue?",
            onConfirm: () => {
                refreshData()
                showAlert({
                    variant: "default",
                    title: "Refreshing Data",
                    message: "Reloading facility data...",
                    duration: 2000,
                })
            },
        })
    }, [refreshData, showAlert, showConfirm])

    if (!filters) return null

    return (
        <>
            {/* Main grid: map (left) & facility list (right) */}
            <div id="mainmap" className="space-y-4">
                <div className="">
                    <InteractiveMap
                        facilities={filteredFacilities || []}
                        selectedFacility={selectedFacility}
                        setSelectedFacility={setSelectedFacility}
                        loading={loading}
                        error={error}
                        onRetry={handleRetry}
                        onMapError={handleMapError}
                        onMarkerClick={handleMarkerClick}
                        height="600px"
                        showAlert={showAlert}
                    />
                </div>
                <div className="">
                    <FacilityCardList
                        facilities={filteredFacilities || []}
                        onSelectFacility={handleSelectFacility}
                        selectedFacilityId={selectedFacility?.id}
                        loading={loading}
                        error={error}
                        onRetry={handleRetry}
                        showAlert={showAlert}
                    />
                </div>
            </div>

            {/* Always show ProximityMap */}
            <ProximityMap centerFacility={selectedFacility} showAlert={showAlert} showConfirm={showConfirm} />
        </>
    )
}
