import { useEffect, useRef } from "react"
import { useMap, Marker } from "@vis.gl/react-google-maps"
import { getPinIcon } from "../ui/pin.jsx"

export function ProximityCircle({ center, radius, unit, color = "#4f46e5" }) {
    const map = useMap()
    const circleRef = useRef(null)
    const proximityIcon = getPinIcon({ color, size: 28, type: "proximity" })

    useEffect(() => {
        if (!map || !center) return

        // Check if google maps is available
        if (typeof window === "undefined" || !window.google) return

        // Remove existing circle if any
        if (circleRef.current) {
            circleRef.current.setMap(null)
        }

        try {
            // Convert radius to meters
            const radiusInMeters = unit === "kilometers" ? radius * 1000 : radius * 1609.34

            // Create new circle
            const circle = new window.google.maps.Circle({
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color,
                fillOpacity: 0.1,
                map,
                center,
                radius: radiusInMeters,
            })

            circleRef.current = circle
        } catch (error) {
            console.error("Error creating proximity circle:", error)
        }

        return () => {
            if (circleRef.current) {
                circleRef.current.setMap(null)
            }
        }
    }, [map, center, radius, unit, color])

    if (!center) return null

    return <Marker position={center} title="Search Center" icon={proximityIcon} />
}
