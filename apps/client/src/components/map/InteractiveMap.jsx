import { useState, useCallback, useRef, useEffect } from "react"
import { APIProvider, Map as GoogleMapComponent } from "@vis.gl/react-google-maps"
import { MarkerPin } from "./MarkerPin.jsx"
import { ProximityCircle } from "./ProximityCircle.jsx"
import { MapLoadingState } from "./MapLoadingState.jsx"
import { MapErrorState } from "./MapErrorState.jsx"
import { MapLegend } from "./MapLegend.jsx"

export function InteractiveMap({
    facilities = [],
    center = { lat: 39.8283, lng: -98.5795 },
    zoom = 4,
    height = "500px",
    className = "",
    onMarkerClick,
    showProximityCircle = false,
    proximityCenter = null,
    proximityRadius = 50,
    proximityUnit = "miles",
    selectedFacility = null,
    setSelectedFacility = null,
    loading = false,
    error = null,
    onRetry,
    onMapError,
    showAlert,
    apiKey = import.meta.env.VITE_GOOGLE_MAPS_API,
}) {
    const [isMapLoading, setIsMapLoading] = useState(true)
    const [mapCenter, setMapCenter] = useState(center)
    const [mapZoom, setMapZoom] = useState(zoom)
    const isProgrammaticChange = useRef(false)
    const [mapError, setMapError] = useState(null)
    const mapContainerRef = useRef(null)

    const updateMapPosition = useCallback((facility) => {
        isProgrammaticChange.current = true
        setMapCenter({ lat: facility.latitude, lng: facility.longitude })
        setMapZoom((prev) => (prev < 5 ? 5 : prev))
        setTimeout(() => {
            isProgrammaticChange.current = false
        }, 0)
    }, [])

    useEffect(() => {
        if (!selectedFacility) return
        updateMapPosition(selectedFacility)
    }, [selectedFacility, updateMapPosition])

    const handleMapLoad = useCallback(() => {
        setIsMapLoading(false)
        setMapError(null)
        showAlert?.({
            variant: "success",
            title: "Map Loaded",
            message: "Interactive map is ready to use",
            duration: 2000,
        })
    }, [showAlert])

    const handleMapError = useCallback((e) => {
        const errorMessage = "Failed to load Google Maps. Please check your API key and internet connection."
        setMapError(errorMessage)
        setIsMapLoading(false)
        onMapError?.(errorMessage)
    }, [onMapError])

    const handleMarkerClick = useCallback(
        (facility) => {
            updateMapPosition(facility)
            onMarkerClick?.(facility)
        },
        [onMarkerClick, updateMapPosition],
    )

    const handleInfoWindowClose = useCallback(() => {
        isProgrammaticChange.current = true
        setSelectedFacility?.(null)

        setTimeout(() => {
            isProgrammaticChange.current = false
        }, 0)
    }, [onMarkerClick, zoom])

    const handleCameraChanged = useCallback((ev) => {
        if (isProgrammaticChange.current) return
        try {
            const { center: c, zoom: z } = ev.detail
            setMapCenter(c)
            setMapZoom(z)
        } catch (err) {
            console.error("Camera change error:", err)
            showAlert?.({
                variant: "warning",
                title: "Map Navigation Issue",
                message: "There was a minor issue with map navigation, but it should continue working normally.",
            })
        }
    }, [showAlert])

    if (loading && !isMapLoading) {
        // Show main loading if data is loading, but map itself has loaded
        return (
            <div className={`w-full rounded-lg border overflow-hidden relative z-10 ${className}`} style={{ height }}>
                <MapLoadingState />
            </div>
        )
    }

    if (error || mapError) {
        return (
            <div className={`w-full rounded-lg border overflow-hidden relative z-10 ${className}`} style={{ height }}>
                <MapErrorState error={error || mapError} onRetry={onRetry} />
            </div>
        )
    }

    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
        return (
            <div className={`w-full rounded-lg border overflow-hidden relative z-10 ${className}`} style={{ height }}>
                <div className="flex items-center justify-center h-full bg-muted">
                    <div className="text-center p-6">
                        <h3 className="text-lg font-semibold mb-2">Google Maps API Key Required</h3>
                        <p className="text-muted-foreground mb-4">
                            To display the map, please add your Google Maps API key to the environment variables.
                        </p>
                        <div className="text-sm text-muted-foreground">
                            <p>Add VITE_GOOGLE_MAPS_API to your .env file</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div ref={mapContainerRef} className={`w-full rounded-lg border overflow-hidden relative z-10 ${className}`} style={{ height }}>

            <APIProvider apiKey={apiKey || ""} >
                <GoogleMapComponent
                    center={mapCenter}
                    zoom={mapZoom}
                    mapId={import.meta.env.VITE_MAP_ID}
                    style={{ width: "100%", height: "100%" }}
                    gestureHandling="greedy"
                    onCameraChanged={handleCameraChanged}
                    onLoad={handleMapLoad}
                    onError={handleMapError}
                    disableDefaultUI
                    options={{ fullscreenControl: true }}
                >
                    <MarkerPin
                        facilities={facilities}
                        selectedFacility={selectedFacility}
                        onMarkerClick={handleMarkerClick}
                        onInfoWindowClose={handleInfoWindowClose}
                    />
                    {showProximityCircle && proximityCenter && (
                        <ProximityCircle center={proximityCenter} radius={proximityRadius} unit={proximityUnit} />
                    )}
                </GoogleMapComponent>
            </APIProvider>
            <MapLegend facilities={facilities} />
        </div>
    )
}
