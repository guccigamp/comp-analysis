import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { X, Settings, ChevronDown, Search, Building, Globe } from "lucide-react"
import { useSearch } from "../../contexts/search-context"
import { flattenFacilityData } from "../../utils/facility-utils"

// Define regions for geographic filtering
const US_REGIONS = {
    northeast: {
        name: "Northeast",
        states: [
            { code: "ME", name: "Maine" },
            { code: "NH", name: "New Hampshire" },
            { code: "VT", name: "Vermont" },
            { code: "MA", name: "Massachusetts" },
            { code: "RI", name: "Rhode Island" },
            { code: "CT", name: "Connecticut" },
            { code: "NY", name: "New York" },
            { code: "NJ", name: "New Jersey" },
            { code: "PA", name: "Pennsylvania" },
        ],
    },
    southeast: {
        name: "Southeast",
        states: [
            { code: "DE", name: "Delaware" },
            { code: "MD", name: "Maryland" },
            { code: "DC", name: "Washington DC" },
            { code: "VA", name: "Virginia" },
            { code: "WV", name: "West Virginia" },
            { code: "KY", name: "Kentucky" },
            { code: "TN", name: "Tennessee" },
            { code: "NC", name: "North Carolina" },
            { code: "SC", name: "South Carolina" },
            { code: "GA", name: "Georgia" },
            { code: "FL", name: "Florida" },
            { code: "AL", name: "Alabama" },
            { code: "MS", name: "Mississippi" },
            { code: "AR", name: "Arkansas" },
            { code: "LA", name: "Louisiana" },
        ],
    },
    midwest: {
        name: "Midwest",
        states: [
            { code: "OH", name: "Ohio" },
            { code: "MI", name: "Michigan" },
            { code: "IN", name: "Indiana" },
            { code: "WI", name: "Wisconsin" },
            { code: "IL", name: "Illinois" },
            { code: "MN", name: "Minnesota" },
            { code: "IA", name: "Iowa" },
            { code: "MO", name: "Missouri" },
            { code: "ND", name: "North Dakota" },
            { code: "SD", name: "South Dakota" },
            { code: "NE", name: "Nebraska" },
            { code: "KS", name: "Kansas" },
        ],
    },
    southwest: {
        name: "Southwest",
        states: [
            { code: "TX", name: "Texas" },
            { code: "OK", name: "Oklahoma" },
            { code: "NM", name: "New Mexico" },
            { code: "AZ", name: "Arizona" },
        ],
    },
    west: {
        name: "West",
        states: [
            { code: "MT", name: "Montana" },
            { code: "WY", name: "Wyoming" },
            { code: "CO", name: "Colorado" },
            { code: "UT", name: "Utah" },
            { code: "ID", name: "Idaho" },
            { code: "WA", name: "Washington" },
            { code: "OR", name: "Oregon" },
            { code: "NV", name: "Nevada" },
            { code: "CA", name: "California" },
            { code: "AK", name: "Alaska" },
            { code: "HI", name: "Hawaii" },
        ],
    },
    international: {
        name: "International",
        states: [
            { code: "Qro.", name: "Querétaro, Mexico" },
            { code: "B.C.", name: "Baja California, Mexico" },
        ],
    },
}

export function AdvancedFilters() {
    const { filters, updateFilters, filteredFacilities } = useSearch()
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("regions")

    // Region state
    const [selectedRegions, setSelectedRegions] = useState([])
    const [selectedStates, setSelectedStates] = useState([])

    // Company state
    const [selectedCompanies, setSelectedCompanies] = useState([])
    const [companySearchTerm, setCompanySearchTerm] = useState("")

    const menuRef = useRef(null)

    // Track if we're updating from context
    const isUpdating = useRef(false)

    // Get all companies with their facility counts
    const allCompaniesData = useMemo(() => {
        const facilities = flattenFacilityData()
        const companyMap = new Map()

        facilities.forEach((facility) => {
            if (companyMap.has(facility.companyId)) {
                companyMap.get(facility.companyId).facilityCount++
            } else {
                companyMap.set(facility.companyId, {
                    id: facility.companyId,
                    name: facility.companyName,
                    color: facility.color,
                    facilityCount: 1,
                })
            }
        })

        return Array.from(companyMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [])

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Sync local state with context when filters change
    useEffect(() => {
        if (isUpdating.current) return

        if (filters.advanced) {
            setSelectedRegions(filters.advanced.selectedRegions || [])
            setSelectedStates(filters.advanced.selectedStates || [])
            setSelectedCompanies(filters.advanced.selectedCompanies || [])
        }
    }, [filters.advanced])

    // Update context when local state changes
    const syncToContext = useCallback(() => {
        isUpdating.current = true
        updateFilters({
            advanced: {
                selectedRegions,
                selectedStates,
                selectedCompanies,
            },
        })
        setTimeout(() => {
            isUpdating.current = false
        }, 0)
    }, [selectedRegions, selectedStates, selectedCompanies, updateFilters])

    // Region handlers
    const handleRegionToggle = useCallback((regionKey) => {
        const region = US_REGIONS[regionKey]
        if (!region) return

        const regionStateCodes = region.states.map((state) => state.code)

        setSelectedRegions((prev) => {
            const newSelectedRegions = prev.includes(regionKey) ? prev.filter((r) => r !== regionKey) : [...prev, regionKey]

            setSelectedStates((prevStates) => {
                if (prev.includes(regionKey)) {
                    return prevStates.filter((state) => !regionStateCodes.includes(state))
                } else {
                    const newStates = [...prevStates]
                    regionStateCodes.forEach((stateCode) => {
                        if (!newStates.includes(stateCode)) {
                            newStates.push(stateCode)
                        }
                    })
                    return newStates
                }
            })

            return newSelectedRegions
        })
    }, [])

    const handleStateToggle = useCallback((stateCode) => {
        setSelectedStates((prev) => {
            const newSelectedStates = prev.includes(stateCode) ? prev.filter((s) => s !== stateCode) : [...prev, stateCode]

            setSelectedRegions((prevRegions) => {
                const newSelectedRegions = [...prevRegions]

                Object.entries(US_REGIONS).forEach(([regionKey, region]) => {
                    const regionStateCodes = region.states.map((state) => state.code)
                    const allStatesSelected = regionStateCodes.every((code) => newSelectedStates.includes(code))
                    const someStatesSelected = regionStateCodes.some((code) => newSelectedStates.includes(code))

                    if (allStatesSelected && !newSelectedRegions.includes(regionKey)) {
                        newSelectedRegions.push(regionKey)
                    } else if (!someStatesSelected && newSelectedRegions.includes(regionKey)) {
                        const index = newSelectedRegions.indexOf(regionKey)
                        newSelectedRegions.splice(index, 1)
                    }
                })

                return newSelectedRegions
            })

            return newSelectedStates
        })
    }, [])

    const isRegionPartiallySelected = useCallback(
        (regionKey) => {
            const region = US_REGIONS[regionKey]
            if (!region) return false

            const regionStateCodes = region.states.map((state) => state.code)
            const selectedCount = regionStateCodes.filter((code) => selectedStates.includes(code)).length

            return selectedCount > 0 && selectedCount < regionStateCodes.length
        },
        [selectedStates],
    )

    // Company handlers
    const handleCompanyToggle = useCallback((companyId) => {
        setSelectedCompanies((prev) => {
            return prev.includes(companyId) ? prev.filter((c) => c !== companyId) : [...prev, companyId]
        })
    }, [])

    // Filter companies based on search term
    const filteredCompanies = useMemo(() => {
        if (!companySearchTerm.trim()) return allCompaniesData

        const searchLower = companySearchTerm.toLowerCase()
        return allCompaniesData.filter((company) => company.name.toLowerCase().includes(searchLower))
    }, [allCompaniesData, companySearchTerm])

    // Clear all filters
    const handleClearAll = useCallback(() => {
        setSelectedRegions([])
        setSelectedStates([])
        setSelectedCompanies([])
        setCompanySearchTerm("")
    }, [])

    // Apply filters
    const handleApplyFilters = useCallback(() => {
        syncToContext()
        setIsOpen(false)
    }, [syncToContext])

    // Count active filters
    const regionFiltersCount =
        selectedRegions.length +
        selectedStates.filter((state) => {
            return !selectedRegions.some((regionKey) => {
                const region = US_REGIONS[regionKey]
                return region && region.states.some((s) => s.code === state)
            })
        }).length

    const companyFiltersCount = selectedCompanies.length

    const totalActiveFilters = regionFiltersCount + companyFiltersCount

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant={totalActiveFilters > 0 ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Settings className="h-4 w-4" />
                Advanced Filters
                {totalActiveFilters > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {totalActiveFilters}
                    </Badge>
                )}
                <ChevronDown className="h-3 w-3" />
            </Button>

            {isOpen && (
                <Card className="absolute top-full mt-2 right-0 w-[480px] shadow-lg z-50 max-h-[600px] overflow-hidden">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Settings className="h-5 w-5" />
                                Advanced Filters
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="regions" className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Regions ({regionFiltersCount})
                                </TabsTrigger>
                                <TabsTrigger value="companies" className="flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    Companies ({companyFiltersCount})
                                </TabsTrigger>
                            </TabsList>

                            {/* Regions Tab */}
                            <TabsContent value="regions" className="space-y-4 max-h-64 overflow-y-auto">
                                {Object.entries(US_REGIONS).map(([regionKey, region]) => {
                                    const isRegionSelected = selectedRegions.includes(regionKey)
                                    const isPartiallySelected = isRegionPartiallySelected(regionKey)

                                    return (
                                        <div key={regionKey} className="space-y-2">
                                            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-md">
                                                <Checkbox
                                                    id={`region-${regionKey}`}
                                                    checked={isRegionSelected}
                                                    ref={(el) => {
                                                        if (el) {
                                                            el.indeterminate = isPartiallySelected && !isRegionSelected
                                                        }
                                                    }}
                                                    onCheckedChange={() => handleRegionToggle(regionKey)}
                                                />
                                                <label
                                                    htmlFor={`region-${regionKey}`}
                                                    className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {region.name}
                                                </label>
                                                <span className="text-xs text-muted-foreground">({region.states.length} states)</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-1 ml-6">
                                                {region.states.map((state) => (
                                                    <div key={state.code} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`state-${state.code}`}
                                                            checked={selectedStates.includes(state.code)}
                                                            onCheckedChange={() => handleStateToggle(state.code)}
                                                        />
                                                        <label
                                                            htmlFor={`state-${state.code}`}
                                                            className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {state.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </TabsContent>

                            {/* Companies Tab */}
                            <TabsContent value="companies" className="space-y-4">
                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search companies..."
                                        value={companySearchTerm}
                                        onChange={(e) => setCompanySearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>

                                <div className="max-h-64 overflow-y-auto space-y-1">
                                    {filteredCompanies.map((company) => (
                                        <div key={company.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                                            <Checkbox
                                                id={`company-${company.id}`}
                                                checked={selectedCompanies.includes(company.id)}
                                                onCheckedChange={() => handleCompanyToggle(company.id)}
                                            />
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: company.color }} />
                                            <label
                                                htmlFor={`company-${company.id}`}
                                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                            >
                                                {company.name}
                                            </label>
                                            <span className="text-xs text-muted-foreground">{company.facilityCount} facilities</span>
                                        </div>
                                    ))}

                                    {companySearchTerm.trim() && filteredCompanies.length === 0 && (
                                        <div className="text-center py-4 text-muted-foreground">
                                            <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p>No companies found matching "{companySearchTerm}"</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-2 border-t">
                            <Button variant="outline" size="sm" onClick={handleClearAll}>
                                Clear All
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleApplyFilters}>
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
