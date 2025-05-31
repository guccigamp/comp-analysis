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

export function SearchProvider({ children }) {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchNearby = useCallback(async (lat, lng, radius = 50) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await facilityApi.getFacilitiesNearby(lat, lng, radius)
      setFacilities(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const searchByState = useCallback(async (state) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await facilityApi.getFacilitiesByState(state)
      setFacilities(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const searchByFilters = useCallback(async (filters) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await facilityApi.getFilteredFacilities(filters)
      setFacilities(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    facilities,
    loading,
    error,
    searchNearby,
    searchByState,
    searchByFilters,
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}
