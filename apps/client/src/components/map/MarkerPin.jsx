"use client"

import { useState, useEffect, useMemo } from "react"
import { Marker, InfoWindow } from "@vis.gl/react-google-maps"

import altorLogo from "../../assets/altor-logo.png?url"; // 👈 Force Vite to give raw URL

// Helper: Convert PNG URL to base64
async function toBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // data:image/png;base64,...
        reader.readAsDataURL(blob);
    });
}

export function MarkerPin({ facilities, selectedFacility, onMarkerClick, onInfoWindowClose }) {
    const [base64Logo, setBase64Logo] = useState(null);

    // Convert PNG to base64 once
    useEffect(() => {
        toBase64(altorLogo).then(setBase64Logo);
    }, []);

    // Create pin icons for each unique color using the new circular design
    const pinIcons = useMemo(() => {
        if (!base64Logo) return {};
        const icons = {}

        // Get unique colors from facilities
        const uniqueColors = [...new Set(facilities.map((facility) => facility.color))]

        // Create a pin icon for each unique color with the new circular design
        uniqueColors.forEach((color) => {
            icons[color] = {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg
          width="36"
          height="48"
          viewBox="0 0 120 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main circle */}
          <circle cx="60" cy="60" r="50" fill="${color}" stroke="${color}" strokeWidth="10" />

          {/* Pin point - downward facing triangle with flat edge at top */}
          <path d="M30 100 L90 100 L60 150 Z" fill="${color}" />

          {/* Inner white circle */}
          <circle cx="60" cy="60" r="45" fill="white" />

          {/* Alleguard logo inside the circle - centered */}
          <image
            href="${base64Logo}"
            x="15"
            y=""
            width="75%"
            height="75%"
            preserveAspectRatio="xMidYMid meet"
          />
        </svg>
        `)}`,
            }
        })

        return icons
    }, [facilities, base64Logo])

    // InfoWindow options to position it above the marker icon (rather than covering it)
    const infoWindowOptions = useMemo(() => {
        // Ensure google maps is loaded before creating Size object
        if (typeof window === "undefined" || !window.google) return {}

        // Negative Y value moves the window up. Adjust -50 based on marker height if necessary.
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
                    icon={pinIcons[facility.color]}
                />
            ))}

            {selectedFacility && (
                <InfoWindow
                    position={{ lat: selectedFacility.latitude, lng: selectedFacility.longitude }}
                    onClose={onInfoWindowClose}
                    options={infoWindowOptions}
                >
                    <div className="p-2">
                        <h3 className="font-medium">{selectedFacility.companyName}</h3>
                        <p className="text-sm text-muted-foreground">{selectedFacility.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: `${selectedFacility.color}20`,
                                    color: selectedFacility.color,
                                }}
                            >
                                {selectedFacility.state}
                            </span>
                        </div>
                    </div>
                </InfoWindow>
            )}
        </>
    )
}
