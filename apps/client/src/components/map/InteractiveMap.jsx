import { useState, useCallback, useRef, useEffect } from "react"
import { APIProvider, Map as GoogleMapComponent } from "@vis.gl/react-google-maps"
import { MarkerPin } from "./MarkerPin"
import { ProximityCircle } from "./ProximityCircle"
import { MapLoadingState } from "./MapLoadingState"
import { MapErrorState } from "./MapErrorState"

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
    loading = false,
    error = null,
    onRetry,
    apiKey = import.meta.env.VITE_GOOGLE_MAPS_API,
}) {
    const [isMapLoading, setIsMapLoading] = useState(true)
    const [mapCenter, setMapCenter] = useState(center)
    const [mapZoom, setMapZoom] = useState(zoom)
    const isProgrammaticChange = useRef(false)
    const [mapError, setMapError] = useState(null)

    useEffect(() => {
        if (!selectedFacility) return
        isProgrammaticChange.current = true
        setMapCenter({ lat: selectedFacility.latitude, lng: selectedFacility.longitude })
        setMapZoom((prev) => (prev < 8 ? 8 : prev))
        setTimeout(() => {
            isProgrammaticChange.current = false
        }, 0)
    }, [selectedFacility])

    const handleMapLoad = useCallback(() => {
        setIsMapLoading(false)
        setMapError(null)
    }, [])

    const handleMapError = useCallback((e) => {
        console.error("Map error:", e)
        setMapError("Failed to load map")
        setIsMapLoading(false)
    }, [])

    const handleMarkerClick = useCallback(
        (facility) => {
            isProgrammaticChange.current = true
            setMapCenter({ lat: facility.latitude, lng: facility.longitude })
            setMapZoom((prev) => (prev < 8 ? 8 : prev))
            onMarkerClick?.(facility)
            setTimeout(() => {
                isProgrammaticChange.current = false
            }, 0)
        },
        [onMarkerClick],
    )

    const handleInfoWindowClose = useCallback(() => onMarkerClick?.(null), [onMarkerClick])

    const handleCameraChanged = useCallback((ev) => {
        if (isProgrammaticChange.current) return
        try {
            const { center: c, zoom: z } = ev.detail
            setMapCenter(c)
            setMapZoom(z)
        } catch (err) {
            console.error("Camera change error:", err)
        }
    }, [])

    if (loading) {
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
        <div className={`w-full rounded-lg border overflow-hidden relative z-10 ${className}`} style={{ height }}>
            <APIProvider apiKey={apiKey || ""} >
                <GoogleMapComponent
                    center={mapCenter}
                    zoom={mapZoom}
                    mapId={import.meta.env.VITE_MAP_ID}
                    style={{ width: "100%", height: "100%" }}
                    gestureHandling="cooperative"
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
        </div>
    )
}
