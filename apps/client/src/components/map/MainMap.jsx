import { useState, useCallback } from "react"
import { useSearch } from "../../contexts/SearchContext.jsx"
import { FacilityCardList } from "./FacilityCardList.jsx"
import { InteractiveMap } from "./InteractiveMap.jsx"
import { ProximityMap } from "./ProximityMap.jsx"

export function MainMap({ showAlert, showConfirm }) {
    // Facility displayed in InfoWindow
    const [focusedFacility, setFocusedFacility] = useState(null)
    // Facilities chosen as proximity centers
    const [selectedCenters, setSelectedCenters] = useState([])
    const { filteredFacilities, filters, loading, error, refreshData, updateFilters } = useSearch()

    if (!filters) return null

    const handleMarkerClick = useCallback(
        (facility) => {
            if (!facility || typeof facility.latitude !== "number" || typeof facility.longitude !== "number") {
                console.error("Invalid facility data for marker click:", facility)
                return
            }

            // Toggle facility in selectedCenters
            setSelectedCenters((prev) => {
                const exists = prev.some((f) => f.id === facility.id)
                if (exists) {
                    return prev // do not remove; keep selection unchanged
                }
                return [...prev, facility]
            })

            // Keep single focused facility for InfoWindow
            setFocusedFacility(facility)
        },
        [],
    )

    const handleSelectFacility = useCallback(
        (facility) => handleMarkerClick(facility),
        [handleMarkerClick],
    )

    const handleDeselectCenter = useCallback((id) => {
        setSelectedCenters((prev) => prev.filter((f) => f.id !== id))
    }, [])

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
                        selectedFacility={focusedFacility}
                        setSelectedFacility={setFocusedFacility}
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
                        selectedFacilityId={focusedFacility?.id}
                        loading={loading}
                        error={error}
                        onRetry={handleRetry}
                        showAlert={showAlert}
                    />
                </div>
            </div>

            {/* Always show ProximityMap */}
            <ProximityMap centers={selectedCenters} onDeselectCenter={handleDeselectCenter} showAlert={showAlert} showConfirm={showConfirm} />
        </>
    )
}
