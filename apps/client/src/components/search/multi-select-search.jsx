"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { X, Search, Building, Globe, MapIcon as City } from "lucide-react"
import { useSearch } from "../../contexts/search-context"
import { getUniqueCompanies, getUniqueStates, getUniqueCities, flattenFacilityData } from "../../utils/facility-utils"

export function MultiSelectSearch() {
    const { filters, totalResults, clearFilters, updateFilters } = useSearch()
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [selectedFilters, setSelectedFilters] = useState([])
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)

    // Track if we're updating from context changes
    const isUpdatingFromContext = useRef(false)

    // Memoized data to prevent unnecessary recalculations
    const { companies, states, cities } = useMemo(() => {
        const allFacilities = flattenFacilityData()
        return {
            companies: getUniqueCompanies(allFacilities),
            states: getUniqueStates(allFacilities),
            cities: getUniqueCities(allFacilities),
        }
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Update selectedFilters when filters change (one-way sync from context to local state)
    useEffect(() => {
        // Skip if we're in the middle of updating the context from local state
        if (isUpdatingFromContext.current) return

        const newSelectedFilters = []

        // Add text filter
        if (filters.searchTerm) {
            newSelectedFilters.push({
                id: `text-${filters.searchTerm}`,
                type: "text",
                label: "Text",
                value: filters.searchTerm,
                icon: <Search className="h-4 w-4" />,
            })
        }

        // Add company filters
        filters.selectedCompanies.forEach((companyId) => {
            const company = companies.find((c) => c.id === companyId)
            if (company) {
                newSelectedFilters.push({
                    id: `company-${company.id}`,
                    type: "company",
                    label: "Company",
                    value: company.name,
                    icon: <Building className="h-4 w-4" />,
                })
            }
        })

        // Add state filters
        filters.selectedStates.forEach((state) => {
            newSelectedFilters.push({
                id: `state-${state}`,
                type: "state",
                label: "State",
                value: state,
                icon: <Globe className="h-4 w-4" />,
            })
        })

        // Add city filters
        filters.selectedCities.forEach((city) => {
            newSelectedFilters.push({
                id: `city-${city}`,
                type: "city",
                label: "City",
                value: city,
                icon: <City className="h-4 w-4" />,
            })
        })

        // Add advanced region filters
        if (filters.advanced?.selectedRegions) {
            filters.advanced.selectedRegions.forEach((regionKey) => {
                // Define regions mapping for display
                const regionNames = {
                    northeast: "Northeast",
                    southeast: "Southeast",
                    midwest: "Midwest",
                    southwest: "Southwest",
                    west: "West",
                    international: "International",
                }

                const regionName = regionNames[regionKey]
                if (regionName) {
                    newSelectedFilters.push({
                        id: `advanced-region-${regionKey}`,
                        type: "advanced-region",
                        label: "Region",
                        value: regionName,
                        icon: <Globe className="h-4 w-4" />,
                    })
                }
            })
        }

        // Add advanced state filters (only those not part of selected regions)
        if (filters.advanced?.selectedStates) {
            const regionStateMapping = {
                northeast: ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"],
                southeast: ["DE", "MD", "DC", "VA", "WV", "KY", "TN", "NC", "SC", "GA", "FL", "AL", "MS", "AR", "LA"],
                midwest: ["OH", "MI", "IN", "WI", "IL", "MN", "IA", "MO", "ND", "SD", "NE", "KS"],
                southwest: ["TX", "OK", "NM", "AZ"],
                west: ["MT", "WY", "CO", "UT", "ID", "WA", "OR", "NV", "CA", "AK", "HI"],
                international: ["Qro.", "B.C."],
            }

            const selectedRegions = filters.advanced.selectedRegions || []
            const statesInSelectedRegions = selectedRegions.flatMap((regionKey) => regionStateMapping[regionKey] || [])

            filters.advanced.selectedStates.forEach((stateCode) => {
                // Only show state if it's not part of a selected region
                if (!statesInSelectedRegions.includes(stateCode)) {
                    const stateNames = {
                        ME: "Maine",
                        NH: "New Hampshire",
                        VT: "Vermont",
                        MA: "Massachusetts",
                        RI: "Rhode Island",
                        CT: "Connecticut",
                        NY: "New York",
                        NJ: "New Jersey",
                        PA: "Pennsylvania",
                        DE: "Delaware",
                        MD: "Maryland",
                        DC: "Washington DC",
                        VA: "Virginia",
                        WV: "West Virginia",
                        KY: "Kentucky",
                        TN: "Tennessee",
                        NC: "North Carolina",
                        SC: "South Carolina",
                        GA: "Georgia",
                        FL: "Florida",
                        AL: "Alabama",
                        MS: "Mississippi",
                        AR: "Arkansas",
                        LA: "Louisiana",
                        OH: "Ohio",
                        MI: "Michigan",
                        IN: "Indiana",
                        WI: "Wisconsin",
                        IL: "Illinois",
                        MN: "Minnesota",
                        IA: "Iowa",
                        MO: "Missouri",
                        ND: "North Dakota",
                        SD: "South Dakota",
                        NE: "Nebraska",
                        KS: "Kansas",
                        TX: "Texas",
                        OK: "Oklahoma",
                        NM: "New Mexico",
                        AZ: "Arizona",
                        MT: "Montana",
                        WY: "Wyoming",
                        CO: "Colorado",
                        UT: "Utah",
                        ID: "Idaho",
                        WA: "Washington",
                        OR: "Oregon",
                        NV: "Nevada",
                        CA: "California",
                        AK: "Alaska",
                        HI: "Hawaii",
                        "Qro.": "Querétaro, Mexico",
                        "B.C.": "Baja California, Mexico",
                    }

                    const stateName = stateNames[stateCode] || stateCode
                    newSelectedFilters.push({
                        id: `advanced-state-${stateCode}`,
                        type: "advanced-state",
                        label: "State",
                        value: stateName,
                        icon: <Globe className="h-4 w-4" />,
                    })
                }
            })
        }

        // Add advanced company filters
        if (filters.advanced?.selectedCompanies) {
            filters.advanced.selectedCompanies.forEach((companyId) => {
                const company = companies.find((c) => c.id === companyId)
                if (company) {
                    newSelectedFilters.push({
                        id: `advanced-company-${company.id}`,
                        type: "advanced-company",
                        label: "Company",
                        value: company.name,
                        icon: <Building className="h-4 w-4" />,
                    })
                }
            })
        }

        setSelectedFilters(newSelectedFilters)
    }, [filters, companies])

    // Generate filter options based on input
    const options = useMemo(() => {
        const searchTerm = inputValue.toLowerCase()
        const newOptions = []

        if (searchTerm || open) {
            // Add company options
            companies.forEach((company) => {
                if (
                    !selectedFilters.some((f) => f.type === "company" && f.value === company.name) &&
                    company.name.toLowerCase().includes(searchTerm)
                ) {
                    newOptions.push({
                        id: `company-${company.id}`,
                        type: "company",
                        label: "Company",
                        value: company.name,
                        icon: <Building className="h-4 w-4" />,
                    })
                }
            })

            // Add state options
            states.forEach((state) => {
                if (
                    !selectedFilters.some((f) => f.type === "state" && f.value === state) &&
                    state.toLowerCase().includes(searchTerm)
                ) {
                    newOptions.push({
                        id: `state-${state}`,
                        type: "state",
                        label: "State",
                        value: state,
                        icon: <Globe className="h-4 w-4" />,
                    })
                }
            })

            // Add city options
            cities.forEach((city) => {
                if (
                    !selectedFilters.some((f) => f.type === "city" && f.value === city) &&
                    city.toLowerCase().includes(searchTerm)
                ) {
                    newOptions.push({
                        id: `city-${city}`,
                        type: "city",
                        label: "City",
                        value: city,
                        icon: <City className="h-4 w-4" />,
                    })
                }
            })
        }

        return newOptions.slice(0, 15) // Limit options for performance
    }, [inputValue, open, selectedFilters, companies, states, cities])

    // Update context when selectedFilters changes (one-way sync from local state to context)
    const syncFiltersToContext = useCallback(() => {
        const newFilters = {
            searchTerm: "",
            selectedCompanies: [],
            selectedStates: [],
            selectedCities: [],
        }

        const advancedFilters = {
            selectedRegions: [],
            selectedStates: [],
            selectedCompanies: [],
        }

        selectedFilters.forEach((filter) => {
            switch (filter.type) {
                case "text":
                    newFilters.searchTerm = filter.value
                    break
                case "company":
                    const company = companies.find((c) => c.name === filter.value)
                    if (company) {
                        newFilters.selectedCompanies.push(company.id)
                    }
                    break
                case "state":
                    newFilters.selectedStates.push(filter.value)
                    break
                case "city":
                    newFilters.selectedCities.push(filter.value)
                    break
                case "advanced-region":
                    // Map region name back to key
                    const regionKeyMap = {
                        Northeast: "northeast",
                        Southeast: "southeast",
                        Midwest: "midwest",
                        Southwest: "southwest",
                        West: "west",
                        International: "international",
                    }
                    const regionKey = regionKeyMap[filter.value]
                    if (regionKey) {
                        advancedFilters.selectedRegions.push(regionKey)
                    }
                    break
                case "advanced-state":
                    // Map state name back to code
                    const stateCodeMap = {
                        Maine: "ME",
                        "New Hampshire": "NH",
                        Vermont: "VT",
                        Massachusetts: "MA",
                        "Rhode Island": "RI",
                        Connecticut: "CT",
                        "New York": "NY",
                        "New Jersey": "NJ",
                        Pennsylvania: "PA",
                        Delaware: "DE",
                        Maryland: "MD",
                        "Washington DC": "DC",
                        Virginia: "VA",
                        "West Virginia": "WV",
                        Kentucky: "KY",
                        Tennessee: "TN",
                        "North Carolina": "NC",
                        "South Carolina": "SC",
                        Georgia: "GA",
                        Florida: "FL",
                        Alabama: "AL",
                        Mississippi: "MS",
                        Arkansas: "AR",
                        Louisiana: "LA",
                        Ohio: "OH",
                        Michigan: "MI",
                        Indiana: "IN",
                        Wisconsin: "WI",
                        Illinois: "IL",
                        Minnesota: "MN",
                        Iowa: "IA",
                        Missouri: "MO",
                        "North Dakota": "ND",
                        "South Dakota": "SD",
                        Nebraska: "NE",
                        Kansas: "KS",
                        Texas: "TX",
                        Oklahoma: "OK",
                        "New Mexico": "NM",
                        Arizona: "AZ",
                        Montana: "MT",
                        Wyoming: "WY",
                        Colorado: "CO",
                        Utah: "UT",
                        Idaho: "ID",
                        Washington: "WA",
                        Oregon: "OR",
                        Nevada: "NV",
                        California: "CA",
                        Alaska: "AK",
                        Hawaii: "HI",
                        "Querétaro, Mexico": "Qro.",
                        "Baja California, Mexico": "B.C.",
                    }
                    const stateCode = stateCodeMap[filter.value] || filter.value
                    advancedFilters.selectedStates.push(stateCode)
                    break
                case "advanced-company":
                    const advancedCompany = companies.find((c) => c.name === filter.value)
                    if (advancedCompany) {
                        advancedFilters.selectedCompanies.push(advancedCompany.id)
                    }
                    break
            }
        })

        // Set flag to prevent circular updates
        isUpdatingFromContext.current = true
        updateFilters({
            ...newFilters,
            advanced: advancedFilters,
        })

        // Reset flag after a short delay to allow render to complete
        setTimeout(() => {
            isUpdatingFromContext.current = false
        }, 0)
    }, [selectedFilters, companies, updateFilters])

    const handleSelect = useCallback((option) => {
        setSelectedFilters((prev) => {
            const newFilters = [...prev, option]
            return newFilters
        })
        setInputValue("")
        setOpen(false)
    }, [])

    const handleRemoveFilter = useCallback((id) => {
        setSelectedFilters((prev) => {
            const newFilters = prev.filter((f) => f.id !== id)
            return newFilters
        })
    }, [])

    const handleTextFilter = useCallback(() => {
        if (!inputValue.trim()) return

        setSelectedFilters((prev) => {
            const existingTextFilterIndex = prev.findIndex((f) => f.type === "text")
            let newFilters

            if (existingTextFilterIndex !== -1) {
                // Update existing text filter
                newFilters = prev.map((f, index) =>
                    index === existingTextFilterIndex ? { ...f, value: inputValue, id: `text-${inputValue}` } : f,
                )
            } else {
                // Add new text filter
                newFilters = [
                    ...prev,
                    {
                        id: `text-${inputValue}`,
                        type: "text",
                        label: "Text",
                        value: inputValue,
                        icon: <Search className="h-4 w-4" />,
                    },
                ]
            }

            return newFilters
        })

        setInputValue("")
        setOpen(false)
    }, [inputValue])

    const handleClearFilters = useCallback(() => {
        setSelectedFilters([])
        clearFilters()
    }, [clearFilters])

    const handleInputKeyDown = useCallback(
        (e) => {
            if (e.key === "Enter") {
                if (options.length > 0) {
                    handleSelect(options[0])
                } else {
                    handleTextFilter()
                }
            }
        },
        [options, handleSelect, handleTextFilter],
    )

    // Sync to context whenever selectedFilters changes
    useEffect(() => {
        if (!isUpdatingFromContext.current) {
            syncFiltersToContext()
        }
    }, [selectedFilters, syncFiltersToContext])

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-2">
                <div className="relative" ref={dropdownRef}>
                    <div className="relative flex items-center w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <div className="flex flex-wrap gap-1 flex-1">
                            {selectedFilters.map((filter) => (
                                <div
                                    key={filter.id}
                                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold gap-1 mr-1 bg-secondary"
                                >
                                    <span className="flex items-center gap-1">
                                        {filter.icon}
                                        <span className="font-medium">{filter.label}:</span> {filter.value}
                                    </span>
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveFilter(filter.id)} />
                                </div>
                            ))}
                            <input
                                ref={inputRef}
                                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px] w-full"
                                placeholder={selectedFilters.length > 0 ? "Add more filters..." : "Search companies, states, cities..."}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                onFocus={() => setOpen(true)}
                            />
                        </div>
                        {selectedFilters.length > 0 && (
                            <button className="ml-2 p-1 hover:bg-accent rounded" onClick={handleClearFilters}>
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown */}
                    {open && options.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            {/* Companies */}
                            {options.filter((option) => option.type === "company").length > 0 && (
                                <div>
                                    <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b">Companies</div>
                                    {options
                                        .filter((option) => option.type === "company")
                                        .slice(0, 5)
                                        .map((option) => (
                                            <div
                                                key={option.id}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                                                onClick={() => handleSelect(option)}
                                            >
                                                <Building className="h-4 w-4" />
                                                {option.value}
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* States */}
                            {options.filter((option) => option.type === "state").length > 0 && (
                                <div>
                                    <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b">States</div>
                                    {options
                                        .filter((option) => option.type === "state")
                                        .slice(0, 5)
                                        .map((option) => (
                                            <div
                                                key={option.id}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                                                onClick={() => handleSelect(option)}
                                            >
                                                <Globe className="h-4 w-4" />
                                                {option.value}
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Cities */}
                            {options.filter((option) => option.type === "city").length > 0 && (
                                <div>
                                    <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b">Cities</div>
                                    {options
                                        .filter((option) => option.type === "city")
                                        .slice(0, 5)
                                        .map((option) => (
                                            <div
                                                key={option.id}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                                                onClick={() => handleSelect(option)}
                                            >
                                                <City className="h-4 w-4" />
                                                {option.value}
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Text Search */}
                            {inputValue.trim() && (
                                <div>
                                    <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b">Special Searches</div>
                                    <div
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                                        onClick={handleTextFilter}
                                    >
                                        <Search className="h-4 w-4" />
                                        Search for "{inputValue}"
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-sm text-muted-foreground">
                {selectedFilters.length > 0 ? (
                    <>Showing {totalResults} facilities matching your search criteria</>
                ) : (
                    <>Showing all {totalResults} facilities</>
                )}
            </div>
        </div>
    )
}
