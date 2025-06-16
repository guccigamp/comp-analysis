import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { X, Search, Building, Globe, MapPin, Hash, Loader2, ChevronDown } from "lucide-react"
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../ui/command.jsx"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover.jsx"
import { Button } from "../ui/button.jsx"
import { Badge } from "../ui/badge.jsx"
import { Separator } from "../ui/separator.jsx"
import { useSearch } from "../../contexts/SearchContext.jsx"
import { companyApi } from "../../lib/api.js"
import { cn } from "../../lib/utils.js"
import { US_REGIONS, FILTER_TYPES, generateSelectedFilterChips } from "./search-bar-helpers.js"

// --- SUB-COMPONENTS ---

const FilterChip = React.memo(({ filter, onRemove }) => {
    const config = FILTER_TYPES[filter.type]
    const Icon = {
        company: Building,
        state: Globe,
        city: MapPin,
        tag: Hash,
        region: Globe,
        text: Search,
    }[filter.type]

    return (
        <Badge variant="secondary" className={cn("gap-1 pr-1 text-xs font-medium", config.color)}>
            <Icon className="h-3 w-3" />
            <span className="font-medium">{config.label}:</span>
            <span>{filter.display}</span>
            <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => {
                    e.stopPropagation()
                    onRemove(filter.id)
                }}
            >
                <X className="h-3 w-3" />
            </Button>
        </Badge>
    )
})
FilterChip.displayName = "FilterChip"

const DropdownSection = React.memo(({ title, icon: Icon, options, onSelect, highlightedIndex, startIndex }) => {
    if (options.length === 0) return null

    return (
        <>
            <CommandGroup heading={title}>
                {options.map((option, index) => (
                    <CommandItem
                        key={option.id}
                        value={option.searchValue}
                        onSelect={() => onSelect(option)}
                        className={cn(
                            "flex items-center gap-2 cursor-pointer",
                            highlightedIndex === startIndex + index && "bg-accent",
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {option.display}
                    </CommandItem>
                ))}
            </CommandGroup>
            <Separator />
        </>
    )
})
DropdownSection.displayName = "DropdownSection"

// --- MAIN COMPONENT ---

export function SearchBar() {
    const { filters, totalResults, clearFilters, updateFilters, loading, error } = useSearch()

    // --- STATE & REFS ---
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [availableOptions, setAvailableOptions] = useState({ companies: [], states: [], cities: [], tags: [] })
    const [optionsLoading, setOptionsLoading] = useState(false)
    const inputRef = useRef(null)

    // --- DATA LOADING ---
    useEffect(() => {
        const loadOptions = async () => {
            setOptionsLoading(true)
            try {
                const res = await companyApi.getAllCompanies()
                const companies = res.data.map((c) => ({ id: c._id, name: c.name, color: c.legend_color }))
                const states = new Set(),
                    cities = new Set(),
                    tags = new Set()
                res.data.forEach((c) => {
                    c.facilities?.forEach((f) => {
                        if (f.state) states.add(f.state)
                        if (f.city) cities.add(f.city)
                        f.tags?.forEach((t) => tags.add(t))
                    })
                })
                setAvailableOptions({
                    companies,
                    states: Array.from(states).sort(),
                    cities: Array.from(cities).sort(),
                    tags: Array.from(tags).sort(),
                })
            } catch (err) {
                console.error("Error loading filter options:", err)
            } finally {
                setOptionsLoading(false)
            }
        }
        loadOptions()
    }, [])

    // --- MEMOIZED DERIVATIONS ---
    const selectedFilters = useMemo(
        () => generateSelectedFilterChips(filters, availableOptions),
        [filters, availableOptions],
    )

    const dropdownOptions = useMemo(() => {
        const searchTerm = inputValue.toLowerCase()
        const options = { companies: [], states: [], cities: [], tags: [], regions: [], textSearch: null }
        if (!searchTerm && !open) return options

        const createOption = (type, value, display, idPrefix) => ({
            id: `${idPrefix}-${value}`,
            type,
            value,
            display,
            searchValue: display,
        })

        const isNotSelected = (type, value) => !selectedFilters.some((f) => f.type === type && f.value === value)

        // Populate options
        availableOptions.companies.forEach(
            (c) =>
                isNotSelected("company", c.id) &&
                c.name.toLowerCase().includes(searchTerm) &&
                options.companies.push(createOption("company", c.id, c.name, "company")),
        )
        availableOptions.states.forEach(
            (s) =>
                isNotSelected("state", s) &&
                s.toLowerCase().includes(searchTerm) &&
                options.states.push(createOption("state", s, s, "state")),
        )
        availableOptions.cities.forEach(
            (c) =>
                isNotSelected("city", c) &&
                c.toLowerCase().includes(searchTerm) &&
                options.cities.push(createOption("city", c, c, "city")),
        )
        availableOptions.tags.forEach(
            (t) =>
                isNotSelected("tag", t) &&
                t.toLowerCase().includes(searchTerm) &&
                options.tags.push(createOption("tag", t, t, "tag")),
        )
        Object.entries(US_REGIONS).forEach(
            ([key, region]) =>
                isNotSelected("region", key) &&
                region.name.toLowerCase().includes(searchTerm) &&
                options.regions.push(createOption("region", key, region.name, "region")),
        )
        if (inputValue.trim()) options.textSearch = createOption("text", inputValue, `Search for "${inputValue}"`, "text")

        // Limit results
        Object.keys(options).forEach((key) => Array.isArray(options[key]) && (options[key] = options[key].slice(0, 8)))
        return options
    }, [inputValue, open, selectedFilters, availableOptions])

    const flatOptions = useMemo(
        () => [
            ...(dropdownOptions.textSearch ? [dropdownOptions.textSearch] : []),
            ...dropdownOptions.companies,
            ...dropdownOptions.states,
            ...dropdownOptions.cities,
            ...dropdownOptions.tags,
            ...dropdownOptions.regions,
        ],
        [dropdownOptions],
    )

    // --- CALLBACKS ---
    const handleSelect = useCallback(
        (option) => {
            const newContextFilters = JSON.parse(JSON.stringify(filters))
            newContextFilters.advanced = newContextFilters.advanced || {
                selectedRegions: [],
                selectedStates: [],
                selectedCompanies: [],
                selectedTags: [],
            }

            const addUnique = (arr, val) => !arr.includes(val) && arr.push(val)

            switch (option.type) {
                case "text":
                    newContextFilters.searchTerm = option.value
                    break
                case "company":
                    addUnique(newContextFilters.selectedCompanies, option.value)
                    break
                case "state":
                    addUnique(newContextFilters.selectedStates, option.value)
                    break
                case "city":
                    addUnique(newContextFilters.selectedCities, option.value)
                    break
                case "tag":
                    addUnique(newContextFilters.advanced.selectedTags, option.value)
                    break
                case "region":
                    addUnique(newContextFilters.advanced.selectedRegions, option.value)
                    break
            }

            updateFilters(newContextFilters)
            setInputValue("")
            setOpen(false)
        },
        [filters, updateFilters],
    )

    const handleRemoveFilter = useCallback(
        (filterIdToRemove) => {
            const chipToRemove = selectedFilters.find((chip) => chip.id === filterIdToRemove)
            if (!chipToRemove) return

            const newContextFilters = JSON.parse(JSON.stringify(filters))
            const remove = (arr, val) => arr.filter((item) => item !== val)

            switch (chipToRemove.type) {
                case "text":
                    newContextFilters.searchTerm = ""
                    break
                case "company":
                    newContextFilters.selectedCompanies = remove(newContextFilters.selectedCompanies, chipToRemove.value)
                    break
                case "state":
                    newContextFilters.selectedStates = remove(newContextFilters.selectedStates, chipToRemove.value)
                    break
                case "city":
                    newContextFilters.selectedCities = remove(newContextFilters.selectedCities, chipToRemove.value)
                    break
                case "tag":
                    newContextFilters.advanced.selectedTags = remove(newContextFilters.advanced.selectedTags, chipToRemove.value)
                    break
                case "region":
                    newContextFilters.advanced.selectedRegions = remove(
                        newContextFilters.advanced.selectedRegions,
                        chipToRemove.value,
                    )
                    break
            }
            updateFilters(newContextFilters)
        },
        [filters, selectedFilters, updateFilters],
    )

    const handleClearAll = useCallback(() => {
        clearFilters()
        setInputValue("")
        setOpen(false)
    }, [clearFilters])

    // --- KEYBOARD NAVIGATION ---
    const handleKeyDown = useCallback(
        (e) => {
            if (!open) {
                if (e.key === "ArrowDown" || e.key === "Enter") {
                    setOpen(true)
                    e.preventDefault()
                }
                return
            }
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    setHighlightedIndex((p) => (p < flatOptions.length - 1 ? p + 1 : 0))
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setHighlightedIndex((p) => (p > 0 ? p - 1 : flatOptions.length - 1))
                    break
                case "Enter":
                    e.preventDefault()
                    if (highlightedIndex >= 0 && flatOptions[highlightedIndex]) {
                        handleSelect(flatOptions[highlightedIndex])
                    } else if (inputValue.trim()) {
                        handleSelect({ type: "text", value: inputValue, display: inputValue, id: `text-${inputValue}` })
                    }
                    break
                case "Escape":
                    setOpen(false)
                    inputRef.current?.blur()
                    break
            }
        },
        [open, flatOptions, highlightedIndex, handleSelect, inputValue],
    )

    useEffect(() => setHighlightedIndex(-1), [flatOptions])

    // --- RENDER ---
    if (error)
        return (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-red-800 text-sm">{error}</p>
            </div>
        )

    return (
        <div className="space-y-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        <div
                            className={cn(
                                "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                                "cursor-text",
                            )}
                        >
                            <div className="flex flex-wrap gap-1 items-center flex-1">
                                {selectedFilters.map((filter) => (
                                    <FilterChip key={filter.id} filter={filter} onRemove={handleRemoveFilter} />
                                ))}
                                <input
                                    ref={inputRef}
                                    className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
                                    placeholder={
                                        selectedFilters.length > 0 ? "Add more filters..." : "Search companies, states, cities..."
                                    }
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setOpen(true)}
                                    disabled={loading || optionsLoading}
                                />
                            </div>
                            {(loading || optionsLoading) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            {selectedFilters.length > 0 && (
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent" onClick={handleClearAll}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <Command>
                        <CommandList className="max-h-[300px]">
                            {flatOptions.length === 0 ? (
                                <CommandEmpty>{optionsLoading ? "Loading options..." : "No options found"}</CommandEmpty>
                            ) : (
                                <>
                                    {dropdownOptions.textSearch && (
                                        <DropdownSection
                                            title="Search"
                                            icon={Search}
                                            options={[dropdownOptions.textSearch]}
                                            onSelect={handleSelect}
                                            highlightedIndex={highlightedIndex}
                                            startIndex={0}
                                        />
                                    )}
                                    <DropdownSection
                                        title="Companies"
                                        icon={Building}
                                        options={dropdownOptions.companies}
                                        onSelect={handleSelect}
                                        highlightedIndex={highlightedIndex}
                                        startIndex={dropdownOptions.textSearch ? 1 : 0}
                                    />
                                    <DropdownSection
                                        title="States"
                                        icon={Globe}
                                        options={dropdownOptions.states}
                                        onSelect={handleSelect}
                                        highlightedIndex={highlightedIndex}
                                        startIndex={(dropdownOptions.textSearch ? 1 : 0) + dropdownOptions.companies.length}
                                    />
                                    <DropdownSection
                                        title="Cities"
                                        icon={MapPin}
                                        options={dropdownOptions.cities}
                                        onSelect={handleSelect}
                                        highlightedIndex={highlightedIndex}
                                        startIndex={
                                            (dropdownOptions.textSearch ? 1 : 0) +
                                            dropdownOptions.companies.length +
                                            dropdownOptions.states.length
                                        }
                                    />
                                    <DropdownSection
                                        title="Tags"
                                        icon={Hash}
                                        options={dropdownOptions.tags}
                                        onSelect={handleSelect}
                                        highlightedIndex={highlightedIndex}
                                        startIndex={
                                            (dropdownOptions.textSearch ? 1 : 0) +
                                            dropdownOptions.companies.length +
                                            dropdownOptions.states.length +
                                            dropdownOptions.cities.length
                                        }
                                    />
                                    <DropdownSection
                                        title="Regions"
                                        icon={Globe}
                                        options={dropdownOptions.regions}
                                        onSelect={handleSelect}
                                        highlightedIndex={highlightedIndex}
                                        startIndex={
                                            (dropdownOptions.textSearch ? 1 : 0) +
                                            dropdownOptions.companies.length +
                                            dropdownOptions.states.length +
                                            dropdownOptions.cities.length +
                                            dropdownOptions.tags.length
                                        }
                                    />
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <div className="text-sm text-muted-foreground">
                {loading ? "Loading facilities..." : `${totalResults} facilities found`}
            </div>
        </div>
    )
}
