"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Button } from "../ui/button.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx"
import { Badge } from "../ui/badge.jsx"
import { Checkbox } from "../ui/checkbox.jsx"
import { Input } from "../ui/input.jsx"
import { X, Search, Building, Globe, Loader2, Hash, Filter, RotateCcw, CheckSquare, Square, ChevronDown, ChevronUp } from "lucide-react"
import { useSearch } from "../../contexts/SearchContext.jsx"
import { companyApi, facilityApi } from "../../lib/api.js"

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

// Filter chip component
const FilterChip = ({ type, value, display, onRemove }) => {
    const getChipConfig = (type) => {
        switch (type) {
            case "company":
                return { icon: Building, color: "bg-green-100 text-green-800 border-green-200" }
            case "region":
                return { icon: Globe, color: "bg-indigo-100 text-indigo-800 border-indigo-200" }
            case "state":
                return { icon: Globe, color: "bg-purple-100 text-purple-800 border-purple-200" }
            case "tag":
                return { icon: Hash, color: "bg-pink-100 text-pink-800 border-pink-200" }
            case "text":
                return { icon: Search, color: "bg-blue-100 text-blue-800 border-blue-200" }
            default:
                return { icon: Filter, color: "bg-gray-100 text-gray-800 border-gray-200" }
        }
    }

    const config = getChipConfig(type)
    const Icon = config.icon

    return (
        <Badge variant="secondary" className={`gap-1 pr-1 text-xs font-medium border ${config.color}`}>
            <Icon className="h-3 w-3" />
            <span>{display}</span>
            <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onRemove(type, value)}
            >
                <X className="h-3 w-3" />
            </Button>
        </Badge>
    )
}

export default function AdvancedFilters({ showAlert, showConfirm }) {
    const { filters, updateFilters, loading, totalResults } = useSearch()
    const [companiesData, setCompaniesData] = useState([])
    const [companiesLoading, setCompaniesLoading] = useState(false)

    // Collapse/Expand state
    const [isExpanded, setIsExpanded] = useState(false)

    // Region state
    const [selectedRegions, setSelectedRegions] = useState([])
    const [selectedStates, setSelectedStates] = useState([])

    // Company state
    const [selectedCompanies, setSelectedCompanies] = useState([])
    const [companySearchTerm, setCompanySearchTerm] = useState("")

    // Tag state
    const [selectedTags, setSelectedTags] = useState([])
    const [availableTags, setAvailableTags] = useState([])
    const [tagSearchTerm, setTagSearchTerm] = useState("")
    const [tagsLoading, setTagsLoading] = useState(false)

    const isUpdating = useRef(false)

    useEffect(() => {
        const loadData = async () => {
            try {
                setCompaniesLoading(true)
                setTagsLoading(true)

                const companiesResponse = await companyApi.getAllCompanies()
                const companies = companiesResponse.data
                    .map((company) => {
                        const facilityCount = company.facilities ? company.facilities.length : 0
                        return {
                            id: company._id,
                            name: company.name,
                            color: company.legend_color,
                            facilityCount,
                        }
                    })
                    .sort((a, b) => a.name.localeCompare(b.name))

                setCompaniesData(companies)
                setCompaniesLoading(false)

                const tagsResponse = await facilityApi.getUniqueTags()
                const tags = tagsResponse.data.map((tagObj) => tagObj.tag) || []
                setAvailableTags(tags.sort())
                setTagsLoading(false)

                showAlert?.({
                    variant: "success",
                    title: "Filters Loaded",
                    message: `Loaded ${companies.length} companies and ${tags.length} tags`,
                    duration: 3000,
                })
            } catch (err) {
                console.error("Error loading data:", err)
                setCompaniesLoading(false)
                setTagsLoading(false)
                showAlert?.({
                    variant: "destructive",
                    title: "Loading Error",
                    message: "Failed to load filter data. Please try refreshing the page.",
                })
            }
        }

        loadData()
    }, [showAlert])

    useEffect(() => {
        if (isUpdating.current) return

        setSelectedCompanies(filters.selectedCompanies || [])
        setSelectedStates(filters.selectedStates || [])

        if (filters.advanced) {
            setSelectedRegions(filters.advanced.selectedRegions || [])
            setSelectedTags(filters.advanced.selectedTags || [])
        }
    }, [filters])

    const syncToContext = useCallback(() => {
        isUpdating.current = true
        updateFilters({
            selectedCompanies,
            selectedStates,
            selectedCities: filters.selectedCities || [],
            proximity: filters.proximity || { enabled: false, center: null, radius: 50, unit: "miles" },
            advanced: {
                selectedRegions,
                selectedStates: [
                    ...selectedStates,
                    ...selectedRegions.flatMap((regionKey) => US_REGIONS[regionKey]?.states.map((s) => s.code) || []),
                ],
                selectedCompanies,
                selectedTags,
                matchAllTags: filters.advanced?.matchAllTags || false,
            },
        })
        setTimeout(() => {
            isUpdating.current = false
        }, 0)
    }, [selectedRegions, selectedStates, selectedCompanies, selectedTags, updateFilters, filters])

    useEffect(() => {
        const timeoutId = setTimeout(syncToContext, 300)
        return () => clearTimeout(timeoutId)
    }, [syncToContext])

    const selectedFilterChips = useMemo(() => {
        const chips = []



        // Companies
        selectedCompanies.forEach((companyId) => {
            const company = companiesData.find((c) => c.id === companyId)
            if (company) {
                chips.push({
                    type: "company",
                    value: companyId,
                    display: company.name,
                })
            }
        })

        // Regions
        selectedRegions.forEach((regionKey) => {
            const region = US_REGIONS[regionKey]
            if (region) {
                chips.push({
                    type: "region",
                    value: regionKey,
                    display: region.name,
                })
            }
        })

        // States (not part of selected regions)
        const regionStates = selectedRegions.flatMap((regionKey) => US_REGIONS[regionKey]?.states.map((s) => s.code) || [])
        selectedStates.forEach((stateCode) => {
            if (!regionStates.includes(stateCode)) {
                chips.push({
                    type: "state",
                    value: stateCode,
                    display: stateCode,
                })
            }
        })

        // Tags
        selectedTags.forEach((tag) => {
            chips.push({
                type: "tag",
                value: tag,
                display: tag,
            })
        })

        return chips
    }, [selectedCompanies, selectedRegions, selectedStates, selectedTags, companiesData])

    const handleRegionToggle = useCallback(
        (regionKey) => {
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

            showAlert?.({
                variant: "default",
                title: "Region Filter Updated",
                message: `${region.name} region ${selectedRegions.includes(regionKey) ? "removed" : "added"}`,
                duration: 2000,
            })
        },
        [showAlert],
    )

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

    const handleCompanyToggle = useCallback(
        (companyId) => {
            setSelectedCompanies((prev) => {
                const isRemoving = prev.includes(companyId)
                const company = companiesData.find((c) => c.id === companyId)

                if (company) {
                    showAlert?.({
                        variant: "default",
                        title: "Company Filter Updated",
                        message: `${company.name} ${isRemoving ? "removed" : "added"}`,
                        duration: 2000,
                    })
                }

                return isRemoving ? prev.filter((c) => c !== companyId) : [...prev, companyId]
            })
        },
        [companiesData, showAlert],
    )

    const handleTagToggle = useCallback(
        (tag) => {
            setSelectedTags((prev) => {
                const isRemoving = prev.includes(tag)

                showAlert?.({
                    variant: "default",
                    title: "Tag Filter Updated",
                    message: `Tag "${tag}" ${isRemoving ? "removed" : "added"}`,
                    duration: 2000,
                })

                return isRemoving ? prev.filter((t) => t !== tag) : [...prev, tag]
            })
        },
        [showAlert],
    )

    const filteredCompanies = useMemo(() => {
        if (!companySearchTerm.trim()) return companiesData

        const searchLower = companySearchTerm.toLowerCase()
        return companiesData.filter((company) => company.name.toLowerCase().includes(searchLower))
    }, [companiesData, companySearchTerm])

    const filteredTags = useMemo(() => {
        if (!tagSearchTerm.trim()) return availableTags

        const searchLower = tagSearchTerm.toLowerCase()
        return availableTags.filter((tag) => tag.toLowerCase().includes(searchLower))
    }, [availableTags, tagSearchTerm])

    const handleRemoveChip = useCallback((type, value) => {
        switch (type) {
            case "company":
                setSelectedCompanies((prev) => prev.filter((id) => id !== value))
                break
            case "region":
                setSelectedRegions((prev) => prev.filter((key) => key !== value))
                break
            case "state":
                setSelectedStates((prev) => prev.filter((code) => code !== value))
                break
            case "tag":
                setSelectedTags((prev) => prev.filter((tag) => tag !== value))
                break
        }
    }, [])

    const handleClearAll = useCallback(() => {
        showConfirm?.({
            title: "Clear All Filters",
            message: "This will remove all active filters and show all facilities. Continue?",
            onConfirm: () => {
                setSelectedRegions([])
                setSelectedStates([])
                setSelectedCompanies([])
                setSelectedTags([])
                setCompanySearchTerm("")
                setTagSearchTerm("")

                showAlert?.({
                    variant: "success",
                    title: "Filters Cleared",
                    message: "All filters have been cleared successfully",
                    duration: 3000,
                })
            },
        })
    }, [showAlert, showConfirm])

    // Clear/Select All handlers for each section
    const handleClearRegions = useCallback(() => {
        setSelectedRegions([])
        setSelectedStates([])
        showAlert?.({
            variant: "default",
            title: "Regions Cleared",
            message: "All region filters have been cleared",
            duration: 2000,
        })
    }, [showAlert])

    const handleSelectAllRegions = useCallback(() => {
        const allRegionKeys = Object.keys(US_REGIONS)
        const allStateCodes = Object.values(US_REGIONS).flatMap((region) => region.states.map((state) => state.code))

        setSelectedRegions(allRegionKeys)
        setSelectedStates(allStateCodes)

        showAlert?.({
            variant: "success",
            title: "All Regions Selected",
            message: `Selected all ${allRegionKeys.length} regions`,
            duration: 2000,
        })
    }, [showAlert])

    const handleClearCompanies = useCallback(() => {
        setSelectedCompanies([])
        showAlert?.({
            variant: "default",
            title: "Companies Cleared",
            message: "All company filters have been cleared",
            duration: 2000,
        })
    }, [showAlert])

    const handleSelectAllCompanies = useCallback(() => {
        const allCompanyIds = filteredCompanies.map((company) => company.id)
        setSelectedCompanies(allCompanyIds)

        showAlert?.({
            variant: "success",
            title: "All Companies Selected",
            message: `Selected ${allCompanyIds.length} companies`,
            duration: 2000,
        })
    }, [filteredCompanies, showAlert])

    const handleClearTags = useCallback(() => {
        setSelectedTags([])
        showAlert?.({
            variant: "default",
            title: "Tags Cleared",
            message: "All tag filters have been cleared",
            duration: 2000,
        })
    }, [showAlert])

    const handleSelectAllTags = useCallback(() => {
        setSelectedTags([...filteredTags])

        showAlert?.({
            variant: "success",
            title: "All Tags Selected",
            message: `Selected ${filteredTags.length} tags`,
            duration: 2000,
        })
    }, [filteredTags, showAlert])

    const regionFiltersCount =
        selectedRegions.length +
        selectedStates.filter((state) => {
            return !selectedRegions.some((regionKey) => {
                const region = US_REGIONS[regionKey]
                return region && region.states.some((s) => s.code === state)
            })
        }).length

    const companyFiltersCount = selectedCompanies.length
    const tagFiltersCount = selectedTags.length

    return (
        <Card className="w-full">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Filter className="h-5 w-5" />
                            Filters
                            {selectedFilterChips.length > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {selectedFilterChips.length}
                                </Badge>
                            )}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-8 w-8 p-0"
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {loading ? "Loading..." : `${totalResults} facilities found`}
                        </span>
                        {selectedFilterChips.length > 0 && (
                            <Button variant="outline" size="sm" onClick={handleClearAll}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>

                {/* Selected filters display */}
                {selectedFilterChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {selectedFilterChips.map((chip, index) => (
                            <FilterChip
                                key={`${chip.type}-${chip.value}-${index}`}
                                type={chip.type}
                                value={chip.value}
                                display={chip.display}
                                onRemove={handleRemoveChip}
                            />
                        ))}
                    </div>
                )}
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {loading || companiesLoading || tagsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2">Loading data...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Regions Column */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-medium">Regions</h3>
                                        {regionFiltersCount > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {regionFiltersCount}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" onClick={handleSelectAllRegions} className="h-7 px-2 text-xs">
                                            <CheckSquare className="h-3 w-3 mr-1" />
                                            All
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearRegions}
                                            className="h-7 px-2 text-xs"
                                            disabled={regionFiltersCount === 0}
                                        >
                                            <Square className="h-3 w-3 mr-1" />
                                            Clear
                                        </Button>
                                    </div>
                                </div>

                                <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
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
                                                        className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                                    >
                                                        {region.name}
                                                    </label>
                                                    <span className="text-xs text-muted-foreground">({region.states.length})</span>
                                                </div>

                                                <div className="grid grid-cols-1 gap-1 ml-6">
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
                                </div>
                            </div>

                            {/* Companies Column */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-medium">Companies</h3>
                                        {companyFiltersCount > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {companyFiltersCount}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSelectAllCompanies}
                                            className="h-7 px-2 text-xs"
                                            disabled={filteredCompanies.length === 0}
                                        >
                                            <CheckSquare className="h-3 w-3 mr-1" />
                                            All
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearCompanies}
                                            className="h-7 px-2 text-xs"
                                            disabled={companyFiltersCount === 0}
                                        >
                                            <Square className="h-3 w-3 mr-1" />
                                            Clear
                                        </Button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search companies..."
                                        value={companySearchTerm}
                                        onChange={(e) => setCompanySearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>

                                <div className="max-h-80 overflow-y-auto space-y-1 pr-2">
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
                                            <span className="text-xs text-muted-foreground">{company.facilityCount}</span>
                                        </div>
                                    ))}

                                    {companySearchTerm.trim() && filteredCompanies.length === 0 && (
                                        <div className="text-center py-4 text-muted-foreground">
                                            <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No companies found matching "{companySearchTerm}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags Column */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-medium">Tags</h3>
                                        {tagFiltersCount > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {tagFiltersCount}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSelectAllTags}
                                            className="h-7 px-2 text-xs"
                                            disabled={filteredTags.length === 0}
                                        >
                                            <CheckSquare className="h-3 w-3 mr-1" />
                                            All
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearTags}
                                            className="h-7 px-2 text-xs"
                                            disabled={tagFiltersCount === 0}
                                        >
                                            <Square className="h-3 w-3 mr-1" />
                                            Clear
                                        </Button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search tags..."
                                        value={tagSearchTerm}
                                        onChange={(e) => setTagSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>

                                <div className="max-h-80 overflow-y-auto space-y-1 pr-2">
                                    {tagsLoading ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span className="ml-2 text-sm">Loading tags...</span>
                                        </div>
                                    ) : filteredTags.length > 0 ? (
                                        filteredTags.map((tag) => (
                                            <div key={tag} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                                                <Checkbox
                                                    id={`tag-${tag}`}
                                                    checked={selectedTags.includes(tag)}
                                                    onCheckedChange={() => handleTagToggle(tag)}
                                                />
                                                <label
                                                    htmlFor={`tag-${tag}`}
                                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                                >
                                                    {tag.replace(/\b\w/g, (match) => match.toUpperCase())}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-muted-foreground">
                                            {tagSearchTerm.trim() ? (
                                                <>
                                                    <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No tags found matching "{tagSearchTerm}"</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No tags available</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    )
}
