"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { APIProvider, Map as GoogleMapComponent, Marker, InfoWindow, AdvancedMarker, Pin } from "@vis.gl/react-google-maps"
import { useSearch } from "../../contexts/search-context"
import { FacilityDetailCard } from "./facility-detail-card"
import { ProximityCircleOverlay } from "./proximity-circle-overlay"
import { FacilityCardList } from "./facility-card-list"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "../ui/button"
import { ProximityMapView } from "./proximity-map-view"

// Generate company initials from company name
function getCompanyInitials(companyName) {
    return companyName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .slice(0, 2) // Take first 2 initials
        .join("")
}

// Create custom pin marker with SVG and company initials
function createCustomPin(color, initials, scale = 1) {
    // Base size for the pin
    const baseWidth = 24
    const baseHeight = 36

    // Apply scale
    const width = baseWidth * scale
    const height = baseHeight * scale

    // Calculate font size based on scale and initials length
    const baseFontSize = initials.length === 1 ? 8 : 6
    const fontSize = baseFontSize * scale

    // SVG for a custom pin shape with company initials
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 36" fill="none">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 7.31 7.96 13.77 10.23 22.38C10.5 35.44 11.17 36 12 36s1.5-.56 1.77-1.62C16.04 25.77 24 19.31 24 12c0-6.63-5.37-12-12-12z" fill="${color}"/>
      <circle cx="12" cy="12" r="8" fill="white"/>
      <text x="12" y="12" textAnchor="middle" dominantBaseline="central" 
            fontFamily="Arial, sans-serif" fontSize="${fontSize}" fontWeight="bold" fill="${color}">
        ${initials}
      </text>
    </svg>
  `

    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    }
}

// Create special proximity pin
function createProximityPin(scale = 1) {
    const baseWidth = 24
    const baseHeight = 36
    const width = baseWidth * scale
    const height = baseHeight * scale

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 36" fill="none">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 7.31 7.96 13.77 10.23 22.38C10.5 35.44 11.17 36 12 36s1.5-.56 1.77-1.62C16.04 25.77 24 19.31 24 12c0-6.63-5.37-12-12-12z" fill="#4f46e5"/>
      <circle cx="12" cy="12" r="8" fill="white"/>
      <circle cx="12" cy="12" r="3" fill="#4f46e5"/>
    </svg>
  `

    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    }
}

export function GoogleMap({
    apiKey = import.meta.env.VITE_GOOGLE_MAPS_API,
    center = { lat: 39.8283, lng: -98.5795 },
    zoom = 4,
}) {
    const [isLoading, setIsLoading] = useState(true)
    const [mapError, setMapError] = useState(null)
    const [selectedFacility, setSelectedFacility] = useState(null)
    const [mapInstance, setMapInstance] = useState(null)
    const [mapCenter, setMapCenter] = useState(center)
    const [mapZoom, setMapZoom] = useState(zoom)
    const loadingTimeoutRef = useRef(null)

    const base64Image = 'data:image/png;base64,';

    // Use filtered facilities from search context
    const { filteredFacilities, filters } = useSearch()

    // Refs to manage programmatic vs user changes
    const isProgrammaticChange = useRef(false)

    // Create custom pin markers for each unique company with initials
    // Create custom pin markers for each unique company
    const customPinIcons = useMemo(() => {
        const icons = {}

        // Get unique companies with their colors and names
        const uniqueCompanies = new Map()
        filteredFacilities.forEach((facility) => {
            if (!uniqueCompanies.has(facility.companyId)) {
                uniqueCompanies.set(facility.companyId, {
                    color: facility.color,
                    name: facility.companyName,
                })
            }
        })

        // Create a custom pin for each unique company
        uniqueCompanies.forEach((company, companyId) => {
            icons[companyId] = createCustomPin(company.color, company.name, 1)
        })

        // Add proximity search icon
        icons["proximity"] = createProximityPin(1.2)

        return icons
    }, [filteredFacilities])

    // Create custom pin marker with SVG - circular for Customer company, pin shape for others
    function createCustomPin(color, companyName, scale = 1) {
        const isCustomer = companyName === 'Customer'

        if (isCustomer) {
            // Create circular marker for Customer company
            const size = 24 * scale
            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="12" r="6" fill="white"/>
            </svg>
        `
            return {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
            }
        } else {
            // Create pin shape for all other companies (without initials)
            const baseWidth = 24
            const baseHeight = 36
            const width = baseWidth * scale
            const height = baseHeight * scale

            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 36" fill="none">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 7.31 7.96 13.77 10.23 22.38C10.5 35.44 11.17 36 12 36s1.5-.56 1.77-1.62C16.04 25.77 24 19.31 24 12c0-6.63-5.37-12-12-12z" fill="${color}"/>
                <circle cx="12" cy="12" r="6" fill="white"/>
            </svg>
        `
            return {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
            }
        }
    }

    // Handle map load
    const handleMapLoad = useCallback((map) => {
        console.log("Map loaded successfully")
        setMapInstance(map)
        setIsLoading(false)

        // Clear the loading timeout
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current)
        }
    }, [])

    // Handle marker click
    const handleMarkerClick = useCallback((facility) => {
        setSelectedFacility(facility)
        isProgrammaticChange.current = true

        setMapCenter({ lat: facility.latitude, lng: facility.longitude })
        setMapZoom((prev) => (prev < 8 ? 8 : prev))

        // drop the flag after one task-queue turn
        setTimeout(() => { isProgrammaticChange.current = false }, 0)
    }, [])


    // Handle info window close
    const handleInfoWindowClose = useCallback(() => {
        setSelectedFacility(null)
    }, [])

    // Handle selecting a facility from the list
    const handleSelectFacility = useCallback(
        (facility) => {
            setSelectedFacility(facility)
            handleMarkerClick(facility)
        },
        [handleMarkerClick],
    )

    // Handle zoom and map center change 
    const handleCameraChanged = useCallback((ev) => {
        if (isProgrammaticChange.current) return          // ignore our own pans
        const { center: c, zoom: z } = ev.detail          // {lat,lng}, number
        setMapCenter(c)
        setMapZoom(z)
    }, [])

    // Force reload the map
    const handleRetry = useCallback(() => {
        setIsLoading(true)
        setMapError(null)

        // Force a re-render by setting a timeout
        setTimeout(() => {
            window.location.reload()
        }, 100)
    }, [])

    // Fallback view when map fails to load
    const renderFallbackView = () => (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-muted/20">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Map Failed to Load</h3>
            <p className="text-center text-muted-foreground mb-4">
                We couldn't load the Google Maps component. This might be due to network issues or an API key problem.
            </p>
            <Button onClick={handleRetry}>Retry Loading Map</Button>
        </div>
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
                <div className="w-full h-[500px] rounded-lg border overflow-hidden relative z-10">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                <p>Loading map...</p>
                                <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
                            </div>
                        </div>
                    )}

                    {mapError ? (
                        renderFallbackView()
                    ) : (
                        <APIProvider apiKey={apiKey || ""} onLoad={handleMapLoad}>
                            <GoogleMapComponent
                                center={mapCenter}
                                zoom={mapZoom}
                                mapId={import.meta.env.VITE_MAP_ID}
                                style={{ width: "100%", height: "100%" }}
                                gestureHandling="cooperative"
                                onCameraChanged={handleCameraChanged}
                                disableDefaultUI={true}
                                options={{
                                    fullscreenControl: true,
                                }}
                            >
                                {/* Facility Markers */}
                                {!isLoading &&
                                    filteredFacilities.map((facility) => (
                                        <Marker
                                            key={facility.id}
                                            position={{ lat: facility.latitude, lng: facility.longitude }}
                                            onClick={() => handleMarkerClick(facility)}
                                            title={`${facility.companyName}: ${facility.address}`}
                                            icon={customPinIcons[facility.companyId]}
                                        />
                                    ))}

                                {/* Proximity Circle and Center Marker */}
                                {!isLoading && filters.proximity?.enabled && filters.proximity?.center && (
                                    <>
                                        <ProximityCircleOverlay
                                            center={{
                                                lat: filters.proximity.center.latitude,
                                                lng: filters.proximity.center.longitude,
                                            }}
                                            radius={filters.proximity.radius}
                                            unit={filters.proximity.unit}
                                        />
                                        <Marker
                                            position={{
                                                lat: filters.proximity.center.latitude,
                                                lng: filters.proximity.center.longitude,
                                            }}
                                            title="Search Center"
                                            icon={customPinIcons["proximity"]}
                                        />
                                    </>
                                )}

                                {/* Info Window */}
                                {!isLoading && selectedFacility && (
                                    <InfoWindow
                                        position={{ lat: selectedFacility.latitude, lng: selectedFacility.longitude }}
                                        onClose={handleInfoWindowClose}
                                    >
                                        <FacilityDetailCard facility={selectedFacility} />
                                    </InfoWindow>
                                )}
                            </GoogleMapComponent>
                        </APIProvider>
                    )}
                </div>

                {selectedFacility && <FacilityDetailCard facility={selectedFacility} />}

                {selectedFacility && filters.proximity?.enabled && !mapError && (
                    // <h1>Proximity Maps</h1>
                    <ProximityMapView centerFacility={selectedFacility} />
                )}
            </div>

            <FacilityCardList
                facilities={filteredFacilities}
                onSelectFacility={handleSelectFacility}
                selectedFacilityId={selectedFacility?.id}
            />
        </div>
    )
}
