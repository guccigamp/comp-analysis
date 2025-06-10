import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react"
import { facilityApi } from "../lib/api.js"
import { transformFacilityData, extractCityFromAddress, buildApiFilters } from "../utils/facility-utils.js"

const SearchContext = createContext(undefined)

export function useSearch() {
    const context = useContext(SearchContext)
    if (context === undefined) {
        throw new Error("useSearch must be used within a SearchProvider")
    }
    return context
}
const DEFAULT_FACILITY_ID = "684790520bac3404d1c69571"
// Start focused on Altor
const initialFilters = {
    searchTerm: "",
    selectedCompanies: [DEFAULT_FACILITY_ID],
    selectedStates: [],
    selectedCities: [],
    proximity: { enabled: false, center: null, radius: 50, unit: "miles" },
    advanced: { selectedRegions: [], selectedStates: [], selectedCompanies: [] },
}

export function SearchProvider({ children }) {
    const [filters, setFilters] = useState(initialFilters)
    const [facilities, setFacilities] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Fetch facilities whenever filters change (runs on mount too)
    useEffect(() => {
        let ignore = false

        const fetchFacilities = async () => {
            try {
                setLoading(true)
                setError(null)

                let response
                // If advanced filters are active, always use the generic filtered endpoint so that all
                // advanced criteria are taken into account. Advanced filters live under
                // `filters.advanced` and may contain regions, states or company selections that are
                // not reflected in the top-level arrays.  
                const advancedActive =
                    !!filters.advanced &&
                    (
                        (filters.advanced.selectedRegions && filters.advanced.selectedRegions.length > 0) ||
                        (filters.advanced.selectedStates && filters.advanced.selectedStates.length > 0) ||
                        (filters.advanced.selectedCompanies && filters.advanced.selectedCompanies.length > 0)
                    )

                if (!advancedActive && filters.selectedStates.length === 1 && !filters.selectedCompanies.length && !filters.searchTerm) {
                    response = await facilityApi.getFacilitiesByState(filters.selectedStates[0])
                } else if (!advancedActive && filters.selectedCompanies.length === 1 && !filters.selectedStates.length && !filters.searchTerm) {
                    response = await facilityApi.getFacilitiesByCompany(filters.selectedCompanies[0])
                } else {
                    // For the main list/map we want *all* facilities matching the filter criteria, regardless of proximity radius.
                    // Therefore strip out the proximity constraint when calling the generic filter endpoint.
                    const filtersWithoutProximity = {
                        ...filters,
                        proximity: {
                            ...filters.proximity,
                            enabled: false, // disable proximity for the main data fetch
                        },
                    }
                    response = await facilityApi.getFilteredFacilities(buildApiFilters(filtersWithoutProximity))
                }

                if (ignore) return

                const facilitiesRaw = Array.isArray(response?.data) ? response.data : []
                let data = transformFacilityData(facilitiesRaw)

                if (filters.selectedCities.length) {
                    data = data.filter((facility) => {
                        const city = facility.city || extractCityFromAddress(facility.address)
                        return filters.selectedCities.includes(city)
                    })
                }

                setFacilities(data)
            } catch (err) {
                if (!ignore) {
                    console.error("Error fetching facilities:", err)
                    setError("Failed to load facilities. Please try again.")
                }
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        fetchFacilities()
        return () => {
            ignore = true
        }
    }, [filters])

    // Update filters function
    const updateFilters = useCallback((newFilters) => {
        setFilters((prev) => {
            try {
                const updatedFilters = { ...prev }

                if (newFilters.proximity) {
                    updatedFilters.proximity = {
                        ...prev.proximity,
                        ...newFilters.proximity,
                    }
                    // The check for enabling proximity without a center is primarily UI concern
                    // handled in ProximitySettings.jsx. Here, we just ensure data validity.
                    if (newFilters.proximity.enabled && !updatedFilters.proximity.center) {
                        console.warn("Proximity enabled attempt without a center in SearchContext. UI should prevent this.")
                    }
                    if (newFilters.proximity.radius) {
                        const radius = Number(newFilters.proximity.radius)
                        if (isNaN(radius) || radius < 1 || radius > 1000) {
                            // This should be caught by ProximitySettings input, but good to have a safeguard.
                            console.error("Invalid proximity radius passed to updateFilters:", newFilters.proximity.radius)
                            // Potentially revert or set a default radius if this happens.
                            // For now, we let it pass, assuming UI validation.
                            // Or, throw new Error("Invalid proximity radius"); and let setError handle it.
                        }
                        updatedFilters.proximity.radius = radius // Ensure it's a number
                    }
                }

                Object.keys(newFilters).forEach(key => {
                    if (key !== 'proximity') {
                        updatedFilters[key] = newFilters[key]
                    }
                })

                if (JSON.stringify(prev) === JSON.stringify(updatedFilters)) {
                    return prev
                }
                return updatedFilters
            } catch (err) {
                console.error("Filter update error:", err)
                setError(err.message) // Set error state for the context
                return prev // Return previous state on error
            }
        })
    }, [])

    // Clear filters function
    const clearFilters = useCallback(() => {
        // Reset all filters to their initial state.
        // This will also clear the proximity center and disable proximity.
        setFilters(initialFilters)
    }, [])

    // Manual refresh (e.g., list view button)
    const refreshData = useCallback(() => {
        setFilters((prev) => ({ ...prev })) // trigger effect with identical filters
    }, [])

    // Memoize results and context value
    const totalResults = useMemo(() => facilities.length, [facilities])

    const contextValue = useMemo(() => ({
        filters,
        filteredFacilities: facilities,
        totalResults,
        updateFilters,
        clearFilters,
        refreshData,
        loading,
        error,
    }), [filters, facilities, totalResults, updateFilters, clearFilters, refreshData, loading, error])

    return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>
}
