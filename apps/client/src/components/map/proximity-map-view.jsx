import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { APIProvider, Map as GoogleMapComponent, Marker, InfoWindow } from "@vis.gl/react-google-maps"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { MapPin, Navigation, Loader2, AlertCircle } from "lucide-react"
import { ProximityCircleOverlay } from "./proximity-circle-overlay"
import { useSearch } from "../../contexts/search-context"
import { calculateDistance } from "../../utils/distance-utils"

// Generate company initials from company name
function getCompanyInitials(companyName) {
    return companyName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("")
}

// Create custom pin marker with SVG and company initials
function createCustomPin(color, initials, isCenter = false, scale = 1) {
    const baseWidth = isCenter ? 28 : 24
    const baseHeight = isCenter ? 42 : 36
    const width = baseWidth * scale
    const height = baseHeight * scale
    const circleRadius = isCenter ? 9 : 8
    const fontSize = isCenter ? 9 : 7

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${baseWidth} ${baseHeight}" fill="none">
      <path d="M${baseWidth / 2} 0C${baseWidth * 0.25} 0 0 ${baseWidth * 0.25} 0 ${baseWidth / 2}c0 ${baseWidth * 0.3} ${baseWidth * 0.55} ${baseWidth * 0.57} ${baseWidth * 0.6} ${baseHeight * 0.9}C${baseWidth * 0.46} ${baseHeight * 0.95} ${baseWidth * 0.48} ${baseHeight} ${baseWidth / 2} ${baseHeight}s${baseWidth * 0.04}-.${baseWidth * 0.05} ${baseWidth * 0.07}-.${baseHeight * 0.1}C${baseWidth * 0.72} ${baseWidth * 0.82} ${baseWidth} ${baseWidth * 0.55} ${baseWidth} ${baseWidth / 2}c0-${baseWidth * 0.25}-${baseWidth * 0.25}-${baseWidth / 2}-${baseWidth / 2}-${baseWidth / 2}z" fill="${color}" stroke="${isCenter ? "#fff" : "none"}" strokeWidth="${isCenter ? 2 : 0}"/>
      <circle cx="${baseWidth / 2}" cy="${baseWidth / 2}" r="${circleRadius}" fill="white"/>
      <text x="${baseWidth / 2}" y="${baseWidth / 2}" textAnchor="middle" dominantBaseline="central" 
            fontFamily="Arial, sans-serif" fontSize="${fontSize}" fontWeight="bold" fill="${color}">
        ${initials}
      </text>
    </svg>
  `

    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    }
}

export function ProximityMapView({
    centerFacility,
    apiKey = process.env.REACT_APP_GOOGLE_MAPS_API || import.meta?.env?.REACT_APP_GOOGLE_MAPS_API,
}) {
    const { filteredFacilities, filters } = useSearch()
    const [selectedFacility, setSelectedFacility] = useState(null)
    const [mapInstance, setMapInstance] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [mapError, setMapError] = useState(null)
    const [mapCenter, setMapCenter] = useState(
        centerFacility
            ? { lat: centerFacility.latitude, lng: centerFacility.longitude }
            : { lat: 0, lng: 0 }
    )
    const [mapZoom, setMapZoom] = useState(6)
    const isProgrammaticChange = useRef(false)

    // Add this check at the very beginning of the component
    if (!centerFacility) {
        console.warn("ProximityMapView: No center facility provided")
        return null
    }

    if (!filters?.proximity) {
        console.warn("ProximityMapView: No proximity filters available")
        return null
    }

    if (!filters.proximity.enabled) {
        console.warn("ProximityMapView: Proximity search not enabled")
        return null
    }

    // Calculate nearby facilities
    const nearbyFacilities = useMemo(() => {
        if (!centerFacility || !filters?.proximity?.enabled) return []

        const centerCoords = {
            latitude: centerFacility.latitude,
            longitude: centerFacility.longitude,
        }

        const radiusInMiles =
            filters.proximity.unit === "kilometers" ? filters.proximity.radius * 0.621371 : filters.proximity.radius

        return filteredFacilities
            .filter((facility) => facility.id !== centerFacility.id)
            .map((facility) => {
                const distance = calculateDistance(centerCoords, {
                    latitude: facility.latitude,
                    longitude: facility.longitude,
                })
                return { ...facility, distance }
            })
            .filter((facility) => facility.distance <= radiusInMiles)
            .sort((a, b) => a.distance - b.distance)
    }, [centerFacility, filteredFacilities, filters?.proximity])

    // Create custom pin marker with SVG - circular for Customer, pin for others
    function createCustomPin(color, companyName, isCenter = false, scale = 1) {
        const isCustomer = companyName === 'Customer'

        if (isCustomer) {
            // Create circular marker for Customer company
            const size = isCenter ? 28 : 24
            const scaledSize = size * scale
            const strokeWidth = isCenter ? 3 : 2

            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${scaledSize}" height="${scaledSize}" viewBox="0 0 ${size} ${size}" fill="none">
                <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - strokeWidth}" fill="${color}" stroke="${isCenter ? '#fff' : 'white'}" strokeWidth="${strokeWidth}"/>
                <circle cx="${size / 2}" cy="${size / 2}" r="${size / 3}" fill="white"/>
            </svg>
        `
            return {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
            }
        } else {
            // Create pin shape for all other companies (without initials)
            const baseWidth = isCenter ? 28 : 24
            const baseHeight = isCenter ? 42 : 36
            const width = baseWidth * scale
            const height = baseHeight * scale

            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${baseWidth} ${baseHeight}" fill="none">
                <path d="M${baseWidth / 2} 0C${baseWidth * 0.25} 0 0 ${baseWidth * 0.25} 0 ${baseWidth / 2}c0 ${baseWidth * 0.3} ${baseWidth * 0.55} ${baseWidth * 0.57} ${baseWidth * 0.6} ${baseHeight * 0.9}C${baseWidth * 0.46} ${baseHeight * 0.95} ${baseWidth * 0.48} ${baseHeight} ${baseWidth / 2} ${baseHeight}s${baseWidth * 0.04}-.${baseWidth * 0.05} ${baseWidth * 0.07}-.${baseHeight * 0.1}C${baseWidth * 0.72} ${baseWidth * 0.82} ${baseWidth} ${baseWidth * 0.55} ${baseWidth} ${baseWidth / 2}c0-${baseWidth * 0.25}-${baseWidth * 0.25}-${baseWidth / 2}-${baseWidth / 2}-${baseWidth / 2}z" fill="${color}" stroke="${isCenter ? "#fff" : "none"}" strokeWidth="${isCenter ? 2 : 0}"/>
                <circle cx="${baseWidth / 2}" cy="${baseWidth / 2}" r="6" fill="white"/>
            </svg>
        `
            return {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
            }
        }
    }


    // Create custom pin markers
    const customPinIcons = useMemo(() => {
        const icons = {}

        // Get unique companies
        const uniqueCompanies = new Map()

        // Add center facility
        if (centerFacility) {
            uniqueCompanies.set(centerFacility.companyId, {
                color: centerFacility.color,
                name: centerFacility.companyName,
            })
        }

        // Add nearby facilities
        nearbyFacilities.forEach((facility) => {
            if (!uniqueCompanies.has(facility.companyId)) {
                uniqueCompanies.set(facility.companyId, {
                    color: facility.color,
                    name: facility.companyName,
                })
            }
        })

        // Create icons for each company
        uniqueCompanies.forEach((company, companyId) => {
            icons[companyId] = createCustomPin(company.color, company.name, false, 1)
            icons[`${companyId}-center`] = createCustomPin(company.color, company.name, true, 1.2)
        })

        return icons
    }, [centerFacility, nearbyFacilities])

    // Calculate map bounds
    const mapBounds = useMemo(() => {
        if (!centerFacility) return null

        const allFacilities = [centerFacility, ...nearbyFacilities]
        if (allFacilities.length === 0) return null

        const bounds = {
            north: Math.max(...allFacilities.map((f) => f.latitude)),
            south: Math.min(...allFacilities.map((f) => f.latitude)),
            east: Math.max(...allFacilities.map((f) => f.longitude)),
            west: Math.min(...allFacilities.map((f) => f.longitude)),
        }

        // Add padding
        const latPadding = (bounds.north - bounds.south) * 0.1 || 0.01
        const lngPadding = (bounds.east - bounds.west) * 0.1 || 0.01

        return {
            north: bounds.north + latPadding,
            south: bounds.south - latPadding,
            east: bounds.east + lngPadding,
            west: bounds.west - lngPadding,
        }
    }, [centerFacility, nearbyFacilities])

    // Handle map load
    const handleMapLoad = useCallback((map) => {
        console.log("Proximity map loaded successfully")
        setMapInstance(map)
        setIsLoading(false)
    }, [])

    // Fit bounds when map instance and bounds are available
    useEffect(() => {
        if (mapInstance && mapBounds && window.google && window.google.maps) {
            try {
                // Create a LatLngBounds object
                const bounds = new window.google.maps.LatLngBounds()

                // Add all facility locations to bounds
                const allFacilities = [centerFacility, ...nearbyFacilities]
                allFacilities.forEach((facility) => {
                    bounds.extend({ lat: facility.latitude, lng: facility.longitude })
                })

                // Only fit bounds if we have facilities
                if (!bounds.isEmpty()) {
                    isProgrammaticChange.current = true
                    mapInstance.fitBounds(bounds)

                    // Set a maximum zoom level to prevent zooming in too much
                    window.google.maps.event.addListenerOnce(mapInstance, "bounds_changed", () => {
                        if (mapInstance.getZoom() > 15) {
                            mapInstance.setZoom(15)
                        }
                        setMapCenter({
                            lat: mapInstance.getCenter().lat(),
                            lng: mapInstance.getCenter().lng(),
                        })
                        setMapZoom(mapInstance.getZoom())
                        isProgrammaticChange.current = false
                    })
                }
            } catch (error) {
                console.warn("Error fitting bounds:", error)
                // Fallback to center on the main facility
                mapInstance.setCenter({ lat: centerFacility.latitude, lng: centerFacility.longitude })
                mapInstance.setZoom(10)
            }
        }
    }, [mapInstance, mapBounds, centerFacility, nearbyFacilities])

    const handleMapError = useCallback((error) => {
        console.error("Proximity map error:", error)
        setMapError("Failed to load proximity map")
        setIsLoading(false)
    }, [])

    // Handle marker click
    const handleMarkerClick = useCallback((facility) => {
        setSelectedFacility(facility)
    }, [])

    // Handle zoom and map center change 
    const handleCameraChanged = useCallback((ev) => {
        if (isProgrammaticChange.current) return          // ignore our own pans
        const { center: c, zoom: z } = ev.detail          // {lat,lng}, number
        setMapCenter(c)
        setMapZoom(z)
    }, [])

    if (!centerFacility || !filters.proximity.enabled) {
        return null
    }

    return (
        <Card className="mt-4">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Navigation className="h-5 w-5" />
                    Nearby Facilities
                    <span className="text-sm font-normal text-muted-foreground">
                        (within {filters.proximity.radius} {filters.proximity.unit})
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Found {nearbyFacilities.length} facilities near {centerFacility.companyName}
                    </span>
                    <span className="text-muted-foreground">
                        Center: {centerFacility.latitude.toFixed(4)}, {centerFacility.longitude.toFixed(4)}
                    </span>
                </div>

                {/* Map */}
                <div className="w-full h-[400px] rounded-lg border overflow-hidden relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                            <div className="text-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                                <p className="text-sm">Loading proximity map...</p>
                            </div>
                        </div>
                    )}

                    {mapError ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                            <div className="text-center">
                                <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                                <p className="text-sm text-red-500">{mapError}</p>
                            </div>
                        </div>
                    ) : (
                        <APIProvider apiKey={apiKey || ""} onLoad={handleMapLoad} onError={handleMapError}>
                            <GoogleMapComponent
                                center={mapCenter}
                                zoom={mapZoom}
                                onCameraChanged={handleCameraChanged}
                                style={{ width: "100%", height: "100%" }}
                                gestureHandling="greedy"
                                disableDefaultUI={true}
                                options={{
                                    fullscreenControl: true,
                                    styles: [
                                        {
                                            featureType: "poi",
                                            elementType: "labels",
                                            stylers: [{ visibility: "off" }],
                                        },
                                    ],
                                }}
                            >
                                {/* Proximity Circle */}
                                <ProximityCircleOverlay
                                    center={{
                                        lat: centerFacility.latitude,
                                        lng: centerFacility.longitude,
                                    }}
                                    radius={filters.proximity.radius}
                                    unit={filters.proximity.unit}
                                />

                                {/* Center Facility Marker */}
                                <Marker
                                    position={{ lat: centerFacility.latitude, lng: centerFacility.longitude }}
                                    onClick={() => handleMarkerClick(centerFacility)}
                                    title={`${centerFacility.companyName} (Center): ${centerFacility.address}`}
                                    icon={customPinIcons[`${centerFacility.companyId}-center`]}
                                />

                                {/* Nearby Facility Markers */}
                                {nearbyFacilities.map((facility) => (
                                    <Marker
                                        key={facility.id}
                                        position={{ lat: facility.latitude, lng: facility.longitude }}
                                        onClick={() => handleMarkerClick(facility)}
                                        title={`${facility.companyName}: ${facility.address} (${facility.distance.toFixed(1)} ${filters.proximity.unit === "kilometers" ? "km" : "mi"} away)`}
                                        icon={customPinIcons[facility.companyId]}
                                    />
                                ))}

                                {/* Info Window */}
                                {selectedFacility && (
                                    <InfoWindow
                                        position={{ lat: selectedFacility.latitude, lng: selectedFacility.longitude }}
                                        onClose={() => setSelectedFacility(null)}
                                    >
                                        <div style={{ padding: "8px", maxWidth: "250px" }}>
                                            <h3 style={{ margin: "0 0 8px", fontWeight: "bold" }}>
                                                {selectedFacility.companyName}
                                                {selectedFacility.id === centerFacility.id && (
                                                    <span style={{ color: "#4f46e5", fontSize: "12px", marginLeft: "8px" }}>(Center)</span>
                                                )}
                                            </h3>
                                            <p style={{ margin: "0 0 8px", fontSize: "14px" }}>{selectedFacility.address}</p>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ color: selectedFacility.color, fontSize: "12px", fontWeight: "bold" }}>
                                                    {selectedFacility.state}
                                                </span>
                                                {selectedFacility.distance !== undefined && (
                                                    <span style={{ fontSize: "12px", color: "#666" }}>
                                                        {selectedFacility.distance.toFixed(1)}{" "}
                                                        {filters.proximity.unit === "kilometers" ? "km" : "mi"} away
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </InfoWindow>
                                )}
                            </GoogleMapComponent>
                        </APIProvider>
                    )}
                </div>

                {/* Nearby Facilities List */}
                {nearbyFacilities.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Nearby Facilities</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                            {nearbyFacilities.slice(0, 10).map((facility) => (
                                <div
                                    key={facility.id}
                                    className="flex items-center justify-between p-2 text-sm border rounded hover:bg-accent cursor-pointer"
                                    onClick={() => handleMarkerClick(facility)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: facility.color }} />
                                        <span className="font-medium">{facility.companyName}</span>
                                        <span className="text-muted-foreground">• {facility.state}</span>
                                    </div>
                                    <span className="text-muted-foreground">
                                        {facility.distance.toFixed(1)} {filters.proximity.unit === "kilometers" ? "km" : "mi"}
                                    </span>
                                </div>
                            ))}
                            {nearbyFacilities.length > 10 && (
                                <div className="text-xs text-muted-foreground text-center py-1">
                                    ... and {nearbyFacilities.length - 10} more facilities
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {nearbyFacilities.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>
                            No facilities found within {filters.proximity.radius} {filters.proximity.unit}
                        </p>
                        <p className="text-xs mt-1">Try increasing the search radius in proximity settings</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
