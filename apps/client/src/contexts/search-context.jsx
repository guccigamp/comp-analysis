"use client"

import { createContext, useContext, useState, useMemo, useCallback } from "react"
import { calculateDistance } from "../utils/distance-utils"
import { extractCityFromAddress } from "../utils/facility-utils"
import { facilityApi } from '../lib/api'

const SearchContext = createContext(undefined)

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}

const initialFilters = {
  searchTerm: "",
  selectedCompanies: [],
  selectedStates: [],
  selectedCities: [],
  proximity: {
    enabled: false,
    center: null,
    radius: 50,
    unit: "miles",
  },
  advanced: {
    selectedRegions: [],
    selectedStates: [],
    selectedCompanies: [],
  },
}

// Define regions for geographic filtering
const US_REGIONS = {
  northeast: {
    name: "Northeast",
    states: ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"],
  },
  southeast: {
    name: "Southeast",
    states: ["DE", "MD", "DC", "VA", "WV", "KY", "TN", "NC", "SC", "GA", "FL", "AL", "MS", "AR", "LA"],
  },
  midwest: {
    name: "Midwest",
    states: ["OH", "MI", "IN", "WI", "IL", "MN", "IA", "MO", "ND", "SD", "NE", "KS"],
  },
  southwest: {
    name: "Southwest",
    states: ["TX", "OK", "NM", "AZ"],
  },
  west: {
    name: "West",
    states: ["MT", "WY", "CO", "UT", "ID", "WA", "OR", "NV", "CA", "AK", "HI"],
  },
  international: {
    name: "International",
    states: ["Qro.", "B.C."],
  },
}

// Define company categories
const COMPANY_CATEGORIES = {
  foam_manufacturing: {
    name: "Foam Manufacturing",
    companies: [
      "Cellofoam",
      "Modern Polymers",
      "EFP",
      "ACH Foam Technologies",
      "Tempo Precision Molded Foam",
      "Houston Foam Plastics",
      "Marko Foam",
      "Michigan Foam",
      "ThermaFoam",
      "Foam Pack Industries",
      "DiversiFoam Products",
    ],
  },
  packaging_solutions: {
    name: "Packaging Solutions",
    companies: [
      "Alleguard - Huntington",
      "Atlas Molded Products",
      "Pal Pac",
      "Mister Packaging",
      "Creative Packaging",
      "Custom Pack",
      "Aqua-Pak Industries Ltd",
    ],
  },
  insulation_products: {
    name: "Insulation Products",
    companies: ["Insulfoam LLC", "Insulated Products Corp (IPC)", "Imperial Foam & Insulation"],
  },
  plastics_manufacturing: {
    name: "Plastics Manufacturing",
    companies: ["Aptco", "Branch River Plastics", "Plastillite", "Beaver Plastics", "Clyde Tool & Die"],
  },
  specialty_products: {
    name: "Specialty Products",
    companies: [
      "Sonoco",
      "Cold Keepers",
      "Styrotech",
      "OpCO",
      "FMI-EPS",
      "Polar Central",
      "Robin II",
      "Speedling",
      "Armstrong Brands",
      "Magna LoBoy",
    ],
  },
  customer_competitor: {
    name: "Customer & Competitor",
    companies: ["Customer", "Altor Solutions"],
  },
}

export function SearchProvider({ children, allFacilities }) {
  const [filters, setFilters] = useState(initialFilters)

  // Memoize the updateFilters function to prevent unnecessary re-renders
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => {
      // Only update if there are actual changes
      const updatedFilters = { ...prev, ...newFilters }

      // Check if proximity is being updated
      if (newFilters.proximity) {
        updatedFilters.proximity = { ...prev.proximity, ...newFilters.proximity }
      }

      // Check if advanced filters are being updated
      if (newFilters.advanced) {
        updatedFilters.advanced = { ...prev.advanced, ...newFilters.advanced }
      }

      // Deep comparison to prevent unnecessary updates
      if (JSON.stringify(prev) === JSON.stringify(updatedFilters)) {
        return prev // No changes, return the previous state
      }

      return updatedFilters
    })
  }, [])

  // Memoize the clearFilters function
  const clearFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

  // Memoized filtered facilities for better performance
  const filteredFacilities = useMemo(() => {
    return allFacilities.filter((facility) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const city = extractCityFromAddress(facility.address)
        const matchesSearch =
          facility.companyName.toLowerCase().includes(searchLower) ||
          facility.address.toLowerCase().includes(searchLower) ||
          facility.state.toLowerCase().includes(searchLower) ||
          city.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false
      }

      // Company filter (from main search)
      if (filters.selectedCompanies.length > 0 && !filters.selectedCompanies.includes(facility.companyId)) {
        return false
      }

      // State filter (from main search)
      if (filters.selectedStates.length > 0 && !filters.selectedStates.includes(facility.state)) {
        return false
      }

      // City filter
      if (filters.selectedCities.length > 0) {
        const city = extractCityFromAddress(facility.address)
        if (!filters.selectedCities.includes(city)) {
          return false
        }
      }

      // Proximity filter
      if (filters.proximity.enabled && filters.proximity.center) {
        const distance = calculateDistance(filters.proximity.center, {
          latitude: facility.latitude,
          longitude: facility.longitude,
        })

        const radiusInMiles =
          filters.proximity.unit === "kilometers" ? filters.proximity.radius * 0.621371 : filters.proximity.radius

        if (distance > radiusInMiles) {
          return false
        }
      }

      // Advanced filters
      if (filters.advanced) {
        // Advanced region/state filters
        const hasAdvancedRegionFilters =
          filters.advanced.selectedRegions.length > 0 || filters.advanced.selectedStates.length > 0

        if (hasAdvancedRegionFilters) {
          let matchesAdvancedRegionFilter = false

          // Define regions for filtering
          const US_REGIONS = {
            northeast: {
              states: ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"],
            },
            southeast: {
              states: ["DE", "MD", "DC", "VA", "WV", "KY", "TN", "NC", "SC", "GA", "FL", "AL", "MS", "AR", "LA"],
            },
            midwest: {
              states: ["OH", "MI", "IN", "WI", "IL", "MN", "IA", "MO", "ND", "SD", "NE", "KS"],
            },
            southwest: {
              states: ["TX", "OK", "NM", "AZ"],
            },
            west: {
              states: ["MT", "WY", "CO", "UT", "ID", "WA", "OR", "NV", "CA", "AK", "HI"],
            },
            international: {
              states: ["Qro.", "B.C."],
            },
          }

          // Check if facility state matches selected regions
          if (filters.advanced.selectedRegions.length > 0) {
            const facilityInSelectedRegion = filters.advanced.selectedRegions.some((regionKey) => {
              const region = US_REGIONS[regionKey]
              return region && region.states.includes(facility.state)
            })
            if (facilityInSelectedRegion) {
              matchesAdvancedRegionFilter = true
            }
          }

          // Check if facility state matches individually selected states
          if (filters.advanced.selectedStates.length > 0) {
            if (filters.advanced.selectedStates.includes(facility.state)) {
              matchesAdvancedRegionFilter = true
            }
          }

          if (!matchesAdvancedRegionFilter) {
            return false
          }
        }

        // Advanced company filters
        if (filters.advanced.selectedCompanies.length > 0) {
          if (!filters.advanced.selectedCompanies.includes(facility.companyId)) {
            return false
          }
        }
      }

      return true
    })
  }, [allFacilities, filters])

  // Memoize the total results
  const totalResults = useMemo(() => filteredFacilities.length, [filteredFacilities])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      filters,
      filteredFacilities,
      updateFilters,
      clearFilters,
      totalResults,
    }),
    [filters, filteredFacilities, updateFilters, clearFilters, totalResults],
  )

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>
}
