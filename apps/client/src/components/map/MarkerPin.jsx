import { useState, useEffect, useMemo } from "react"
import { Marker, InfoWindow } from "@vis.gl/react-google-maps"
import { usePinIcon } from "../ui/pin"
import altorLogo from "../../assets/altor-logo.png?url"

// Helper: Convert PNG URL to base64
async function toBase64(url) {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })
}

export function MarkerPin({ facilities, selectedFacility, onMarkerClick, onInfoWindowClose }) {
    const [base64Logo, setBase64Logo] = useState(null)

    // Convert PNG to base64 once
    useEffect(() => {
        toBase64(altorLogo).then(setBase64Logo)
    }, [])

    // InfoWindow options to position it above the marker icon
    const infoWindowOptions = useMemo(() => {
        if (typeof window === "undefined" || !window.google) return {}
        return {
            pixelOffset: new window.google.maps.Size(0, -50),
        }
    }, [])

    return (
        <>
            {facilities.map((facility) => (
                <Marker
                    key={facility.id}
                    position={{ lat: facility.latitude, lng: facility.longitude }}
                    onClick={() => onMarkerClick(facility)}
                    title={`${facility.name}`}
                    icon={usePinIcon({
                        color: facility.color,
                        size: 36,
                        type: "facility",
                        logoUrl: base64Logo
                    })}
                />
            ))}

            {selectedFacility && (
                <InfoWindow
                    position={{ lat: selectedFacility.latitude, lng: selectedFacility.longitude }}
                    onClose={onInfoWindowClose}
                    options={infoWindowOptions}
                >
                    <div className="p-4 max-w-[300px]">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full" style={{ backgroundColor: `${selectedFacility.color}20` }}>
                                <svg className="h-5 w-5" style={{ color: selectedFacility.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="font-bold text-lg mb-1">{selectedFacility.name}</h2>
                                <h3 className="font-bold text-sm mb-1">{selectedFacility.companyName}</h3>
                                <p className="text-sm text-muted-foreground">{selectedFacility.address}</p>

                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span
                                        className="text-xs px-2 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: `${selectedFacility.color}20`,
                                            color: selectedFacility.color,
                                        }}
                                    >
                                        {selectedFacility.state}
                                    </span>

                                    {selectedFacility.tags && selectedFacility.tags.length > 0 &&
                                        selectedFacility.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs px-2 py-0.5 rounded-full"
                                                style={{
                                                    backgroundColor: `${selectedFacility.color}20`,
                                                    color: selectedFacility.color,
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                </div>

                                <div className="mt-3 space-y-2">
                                    {selectedFacility.phone && (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <a href={`tel:${selectedFacility.phone}`} className="text-sm text-blue-600 hover:underline">
                                                {selectedFacility.phone}
                                            </a>
                                        </div>
                                    )}

                                    {selectedFacility.email && (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <a href={`mailto:${selectedFacility.email}`} className="text-sm text-blue-600 hover:underline">
                                                {selectedFacility.email}
                                            </a>
                                        </div>
                                    )}

                                    {selectedFacility.website && (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                            <a
                                                href={selectedFacility.website.startsWith('http') ? selectedFacility.website : `https://${selectedFacility.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                {selectedFacility.website}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {selectedFacility.description && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-sm text-muted-foreground">{selectedFacility.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </InfoWindow>
            )}
        </>
    )
}
