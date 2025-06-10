import { useEffect, useRef } from "react"
import { useMap } from "@vis.gl/react-google-maps"

export function ProximityCircleOverlay({ center, radius, unit }) {
    const map = useMap()
    const circleRef = useRef(null)

    useEffect(() => {
        if (!map) return

        // Remove existing circle
        if (circleRef.current) {
            circleRef.current.setMap(null)
        }

        // Convert radius to meters
        const radiusInMeters = unit === "kilometers" ? radius * 1000 : radius * 1609.34

        // Create new circle
        const circle = new google.maps.Circle({
            strokeColor: "#4f46e5",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#4f46e5",
            fillOpacity: 0.1,
            map,
            center,
            radius: radiusInMeters,
        })

        circleRef.current = circle

        return () => {
            if (circleRef.current) {
                circleRef.current.setMap(null)
            }
        }
    }, [map, center, radius, unit])

    return null
}
