import { useMemo } from "react"

// Base pin SVG template with customizable elements
const createPinSvg = ({ width, height, color, type, logoUrl = null }) => {
  const baseSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 29" fill="none">
            <circle cx="12" cy="12" r="11" fill="${color}" stroke="white" strokeWidth="2"/>
            <path d="M12 23L8 18h8l-4 5z" fill="${color}"/>
            ${type === "proximity" ? '<circle cx="12" cy="12" r="4" fill="white"/>' : ''}
            ${logoUrl ? `<image href="${logoUrl}" x="3" y="3" width="18" height="18" preserveAspectRatio="xMidYMid meet"/>` : ''}
        </svg>
    `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(baseSvg)}`
}

// Custom pin SVG template for facility markers with logo
const createFacilityPinSvg = ({ width, height, color, logoUrl }) => {
  const svg = `
        <svg width="${width}" height="${height}" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="${color}" stroke="${color}" strokeWidth="10" />
            <path d="M30 100 L90 100 L60 150 Z" fill="${color}" />
            <circle cx="60" cy="60" r="45" fill="white" />
            ${logoUrl ? `<image href="${logoUrl}" x="15" y="15" width="90" height="90" preserveAspectRatio="xMidYMid meet"/>` : ''}
        </svg>
    `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function Pin({ color = "#4f46e5", size = 24, type = "facility", logoUrl = null }) {
  const width = size
  const height = size * 1.2 // Slightly taller than width for the point

  return useMemo(() => {
    if (type === "facility" && logoUrl) {
      return createFacilityPinSvg({ width, height, color, logoUrl })
    }
    return createPinSvg({ width, height, color, type, logoUrl })
  }, [color, size, type, logoUrl])
}

// Hook to use the Pin component for Google Maps markers
export function usePinIcon({ color = "#4f46e5", size = 24, type = "facility", logoUrl = null }) {
  return useMemo(() => {
    const width = size
    const height = size * 1.2

    let url
    if (type === "facility" && logoUrl) {
      url = createFacilityPinSvg({ width, height, color, logoUrl })
    } else {
      url = createPinSvg({ width, height, color, type, logoUrl })
    }

    return { url }
  }, [color, size, type, logoUrl])
}

// NEW: Non-hook helper to generate (and memoise) pin icons at arbitrary call sites (e.g. inside loops)
const _iconCache = new Map()
export function getPinIcon({ color = "#4f46e5", size = 24, type = "facility", logoUrl = null }) {
  const cacheKey = `${color}-${size}-${type}-${logoUrl ?? "none"}`
  if (_iconCache.has(cacheKey)) return _iconCache.get(cacheKey)

  const width = size
  const height = size * 1.2

  let url
  if (type === "facility" && logoUrl) {
    url = createFacilityPinSvg({ width, height, color, logoUrl })
  } else {
    url = createPinSvg({ width, height, color, type, logoUrl })
  }

  const icon = { url }
  _iconCache.set(cacheKey, icon)
  return icon
}
