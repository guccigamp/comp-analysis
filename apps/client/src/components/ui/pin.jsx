"use client"

import { useMemo } from "react"

export function Pin({ color = "#4f46e5", size = 24, type = "facility" }) {
    const pinIcon = useMemo(() => {
        const width = size
        const height = size * 1.2 // Slightly taller than width for the point

        if (type === "proximity") {
            // Special proximity pin with center dot
            const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 29" fill="none">
          <circle cx="12" cy="12" r="11" fill="${color}" stroke="white" strokeWidth="2"/>
          <path d="M12 23L8 18h8l-4 5z" fill="${color}"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      `
            return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
        }

        // Standard facility pin - circular with triangular point
        const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 29" fill="none">
        <circle cx="12" cy="12" r="11" fill="${color}" stroke="white" strokeWidth="2"/>
        <path d="M12 23L8 18h8l-4 5z" fill="${color}"/>
      </svg>
    `

        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
    }, [color, size, type])

    return pinIcon
}

// Hook to use the Pin component for Google Maps markers
export function usePinIcon(color, size, type) {
    return useMemo(() => {
        const width = size || 24
        const height = (size || 24) * 1.2

        if (type === "proximity") {
            const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 29" fill="none">
          <circle cx="12" cy="12" r="11" fill="${color || "#4f46e5"}" stroke="white" strokeWidth="2"/>
          <path d="M12 23L8 18h8l-4 5z" fill="${color || "#4f46e5"}"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      `
            return {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
            }
        }

        const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 29" fill="none">
        <circle cx="12" cy="12" r="11" fill="${color || "#4f46e5"}" stroke="white" strokeWidth="2"/>
        <path d="M12 23L8 18h8l-4 5z" fill="${color || "#4f46e5"}"/>
      </svg>
    `

        return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        }
    }, [color, size, type])
}
