import { useState, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps"
import { scaleQuantile } from "d3-scale" // Changed from scaleQuantize for better distribution with specific thresholds
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.jsx"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table.jsx"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Tooltip as ReactTooltip } from "react-tooltip"
import "react-tooltip/dist/react-tooltip.css"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.jsx"
import { geoCentroid } from "d3-geo"

// US States GeoJSON
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"

// Centralised metadata for each state: abbreviation -> { name, fips }
const statesMeta = {
    AL: { name: "Alabama", fips: "01" },
    AK: { name: "Alaska", fips: "02" },
    AZ: { name: "Arizona", fips: "04" },
    AR: { name: "Arkansas", fips: "05" },
    CA: { name: "California", fips: "06" },
    CO: { name: "Colorado", fips: "08" },
    CT: { name: "Connecticut", fips: "09" },
    DE: { name: "Delaware", fips: "10" },
    DC: { name: "District of Columbia", fips: "11" },
    FL: { name: "Florida", fips: "12" },
    GA: { name: "Georgia", fips: "13" },
    HI: { name: "Hawaii", fips: "15" },
    ID: { name: "Idaho", fips: "16" },
    IL: { name: "Illinois", fips: "17" },
    IN: { name: "Indiana", fips: "18" },
    IA: { name: "Iowa", fips: "19" },
    KS: { name: "Kansas", fips: "20" },
    KY: { name: "Kentucky", fips: "21" },
    LA: { name: "Louisiana", fips: "22" },
    ME: { name: "Maine", fips: "23" },
    MD: { name: "Maryland", fips: "24" },
    MA: { name: "Massachusetts", fips: "25" },
    MI: { name: "Michigan", fips: "26" },
    MN: { name: "Minnesota", fips: "27" },
    MS: { name: "Mississippi", fips: "28" },
    MO: { name: "Missouri", fips: "29" },
    MT: { name: "Montana", fips: "30" },
    NE: { name: "Nebraska", fips: "31" },
    NV: { name: "Nevada", fips: "32" },
    NH: { name: "New Hampshire", fips: "33" },
    NJ: { name: "New Jersey", fips: "34" },
    NM: { name: "New Mexico", fips: "35" },
    NY: { name: "New York", fips: "36" },
    NC: { name: "North Carolina", fips: "37" },
    ND: { name: "North Dakota", fips: "38" },
    OH: { name: "Ohio", fips: "39" },
    OK: { name: "Oklahoma", fips: "40" },
    OR: { name: "Oregon", fips: "41" },
    PA: { name: "Pennsylvania", fips: "42" },
    RI: { name: "Rhode Island", fips: "44" },
    SC: { name: "South Carolina", fips: "45" },
    SD: { name: "South Dakota", fips: "46" },
    TN: { name: "Tennessee", fips: "47" },
    TX: { name: "Texas", fips: "48" },
    UT: { name: "Utah", fips: "49" },
    VT: { name: "Vermont", fips: "50" },
    VA: { name: "Virginia", fips: "51" },
    WA: { name: "Washington", fips: "53" },
    WV: { name: "West Virginia", fips: "54" },
    WI: { name: "Wisconsin", fips: "55" },
    WY: { name: "Wyoming", fips: "56" },
}

// Derived helper objects to avoid redundancy
const stateAbbreviations = Object.entries(statesMeta).reduce((acc, [abbr, { name }]) => {
    acc[name] = abbr
    return acc
}, {})

const stateFips = Object.entries(statesMeta).reduce((acc, [abbr, { fips }]) => {
    acc[abbr] = fips
    return acc
}, {})

const stateNames = Object.entries(statesMeta).reduce((acc, [abbr, { name }]) => {
    acc[abbr] = name
    return acc
}, {})

/**
 * Displays a heat map of facility distribution by state, along with chart and table views.
 * @param {object} props - The component's props.
 * @param {Array<object>} props.facilities - Array of facility objects. This will be used to derive state counts if stateSummaries is not provided.
 * @param {Array<{state: string, count: number}>} [props.stateSummaries] - Optional pre-aggregated array of objects, each containing a state and its facility count.
 */
export function StateHeatMap({ facilities, stateSummaries: initialSateSummaries }) {
    const [viewMode, setViewMode] = useState("map")
    const [selectedState, setSelectedState] = useState("TX") // default Texas

    const stateData = useMemo(() => {
        const data = {}
        if (initialSateSummaries) {
            initialSateSummaries.forEach((item) => {
                data[item.state] = item.count
            })
        }
        return data
    }, [initialSateSummaries])

    // Updated color scale and legend to match the image
    const colorRange = [
        "#f0f8ff", // 0-1 (AliceBlue - very light)
        "#e0f0ff", // 2
        "#d0e8ff", // 3
        "#c0e0ff", // 4-5
        "#b0d8ff", // 6
        "#007bff", // 7 (Distinct blue for Montana in example)
        "#006ae0", // 8-9
        "#005ac8", // 10
        "#004ab0", // 11
        "#003a98", // 12-13
    ]

    const domainThresholds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] // Max value for each bucket

    const colorScale = useMemo(() => {
        return scaleQuantile()
            .domain(domainThresholds) // Use specific thresholds
            .range(colorRange)
    }, [])

    const sortedStateSummaries = useMemo(() => {
        if (!initialSateSummaries) return []
        return [...initialSateSummaries].sort((a, b) => b.count - a.count)
    }, [initialSateSummaries])

    const chartData = useMemo(() => {
        return sortedStateSummaries.slice(0, 15).map((item) => ({
            state: item.state,
            count: item.count,
            stateName: stateNames[item.state] || item.state,
        }))
    }, [sortedStateSummaries, stateNames])

    // List of state abbreviations that have facilities (derived from facilities array)
    const statesWithFacilities = useMemo(() => {
        const set = new Set()
        facilities.forEach((fac) => {
            const abbr = stateAbbreviations[fac.state] || fac.state
            set.add(abbr)
        })
        return Array.from(set).sort()
    }, [facilities])

    // Ensure default selection exists
    useEffect(() => {
        if (!statesWithFacilities.includes(selectedState) && statesWithFacilities.length > 0) {
            setSelectedState(statesWithFacilities.includes("TX") ? "TX" : statesWithFacilities[0])
        }
    }, [statesWithFacilities])

    // Facilities grouped by company for selected state
    const companiesInSelectedState = useMemo(() => {
        const groups = {}
        facilities.forEach((facility) => {
            const abbr = stateAbbreviations[facility.state] || facility.state
            if (abbr === selectedState) {
                if (!groups[facility.companyId]) {
                    groups[facility.companyId] = {
                        companyId: facility.companyId,
                        companyName: facility.companyName,
                        color: facility.color,
                        facilities: [],
                    }
                }
                groups[facility.companyId].facilities.push(facility)
            }
        })
        return Object.values(groups).sort((a, b) => b.facilities.length - a.facilities.length)
    }, [facilities, selectedState])

    // Flat list of facilities in selected state (for markers)
    const facilitiesInSelectedState = useMemo(() => {
        return facilities.filter((f) => {
            const abbr = stateAbbreviations[f.state] || f.state
            return abbr === selectedState
        })
    }, [facilities, selectedState])

    if (!facilities && (!initialSateSummaries || initialSateSummaries.length === 0)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Facility Count per State</CardTitle>
                    <CardDescription>Geographic distribution of facilities across states</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-10">Loading data or no data available...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analyzing Facilities across States</CardTitle>
                <CardDescription>Geographic distribution of facilities across states</CardDescription>
            </CardHeader>
            <CardContent>
                {/* State selection and detail */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-2 block">Select State</label>
                            <Select value={selectedState} onValueChange={setSelectedState}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a state" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                    {statesWithFacilities.map((abbr) => (
                                        <SelectItem key={abbr} value={abbr}>
                                            {stateNames[abbr] || abbr}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Detail section */}
                    <div className="flex flex-col md:flex-row gap-6 mt-4">
                        {/* Left: company/facility info */}
                        <div className="w-full md:w-1/2 space-y-6 max-h-[400px] overflow-y-auto pr-2">
                            {companiesInSelectedState.map((company) => (
                                <div key={company.companyId}>
                                    <h3 className="font-medium text-lg mb-2" style={{ color: company.color }}>
                                        {company.companyName}: {company.facilities.length} facilities
                                    </h3>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Address</TableHead>
                                                <TableHead>Tags</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {company.facilities.map((f) => (
                                                <TableRow key={f.id}>
                                                    <TableCell>{f.name}</TableCell>
                                                    <TableCell>{f.address}</TableCell>
                                                    <TableCell>
                                                        {Array.isArray(f.tags) ? f.tags.join(", ") : f.tags}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ))}
                            {companiesInSelectedState.length === 0 && (
                                <p className="text-sm text-muted-foreground">No facilities in selected state.</p>
                            )}
                        </div>

                        {/* Right: visual of selected state only */}
                        <div className="w-full md:w-1/2 h-[350px]">
                            <ComposableMap projection="geoAlbers" style={{ width: "100%", height: "100%" }} className="border rounded-md">
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) => {
                                        const geo = geographies.find((g) => {
                                            const abbr = stateAbbreviations[g.properties.name] || g.properties.name
                                            return abbr === selectedState
                                        })
                                        if (!geo) return null
                                        const [lon, lat] = geoCentroid(geo)
                                        return (
                                            <ZoomableGroup center={[lon, lat]} zoom={4} disablePanning>
                                                <Geography geography={geo} fill="#007bff" stroke="#FFFFFF" style={{ default: { outline: "none" } }} />
                                                {facilitiesInSelectedState.map((fac) => {
                                                    const tagText = Array.isArray(fac.tags) ? fac.tags.join(", ") : fac.tags || ""
                                                    const tooltipHtml = `<div style='text-align:left;'>
                                                        <strong>${fac.name}</strong><br/>
                                                        <span style='font-size: 14px;'>${fac.companyName}</span><br/>
                                                        <span style='font-size: 11px;'>Address: ${fac.address}</span><br/>
                                                        <span style='font-size: 11px;'>Tags: ${tagText}</span>
                                                    </div>`
                                                    return (
                                                        <Marker key={fac.id} coordinates={[fac.longitude, fac.latitude]}>
                                                            <circle
                                                                r={4}
                                                                fill={fac.color || "#333"}
                                                                stroke="#fff"
                                                                strokeWidth={1}
                                                                data-tooltip-id="facility-tooltip"
                                                                data-tooltip-html={tooltipHtml}
                                                            />
                                                        </Marker>
                                                    )
                                                })}
                                            </ZoomableGroup>
                                        )
                                    }}
                                </Geographies>
                            </ComposableMap>
                        </div>
                    </div>
                </div>

                <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                        <TabsTrigger value="map">Chloropleth Map</TabsTrigger>
                        <TabsTrigger value="chart">Distribution</TabsTrigger>
                        <TabsTrigger value="table">Table</TabsTrigger>
                    </TabsList>

                    <TabsContent value="map">
                        <div className="h-[800px] w-full rounded-md p-2 bg-white">
                            <div className="m-4">
                                <h2 className="text-2xl font-bold">Heat Map</h2>
                                <p className="text-sm text-muted-foreground">
                                    A geographic visualization showing the number of facilities across different states. Darker shades indicate a higher concentration of facilities.
                                </p>
                            </div>
                            {/* Gradient legend */}
                            <div className="flex justify-center mt-10 mb-[-100px]">
                                <div className="flex items-center space-x-2">
                                    <div className="flex space-x-1">
                                        {colorScale.range().map((color, i) => (
                                            <div key={i} style={{ backgroundColor: color }} className="w-6 h-4" />
                                        ))}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <span>Fewer</span>
                                        <span className="mx-2">→</span>
                                        <span>More Facilities</span>
                                    </div>
                                </div>
                            </div>
                            {/* Chloropleth Map */}
                            <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 900 }}>
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) =>
                                        geographies.map((geo) => {
                                            // us-atlas states GeoJSON does not include a `postal` property – it has `name` and `id`.
                                            // Derive the state abbreviation from the `name` property using the `stateAbbreviations` map.
                                            const stateName = geo.properties.name
                                            const stateCode = stateAbbreviations[stateName] || stateName
                                            const count = stateData[stateCode] || 0
                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    fill={count > 0 ? colorScale(count) : "#EEE"}
                                                    stroke="#FFF"
                                                    data-tooltip-id="state-tooltip"
                                                    data-tooltip-content={`${stateNames[stateCode] || stateName}: ${count} facilities`}
                                                    style={{
                                                        default: { outline: "none" },
                                                        hover: { outline: "none", fill: "#0052cc" },
                                                        pressed: { outline: "none" },
                                                    }}
                                                />
                                            )
                                        })
                                    }
                                </Geographies>
                            </ComposableMap>

                        </div>
                        <ReactTooltip id="state-tooltip" />
                    </TabsContent>

                    <TabsContent value="chart">
                        <div className="h-[500px]">
                            <div className="m-4">
                                <h3 className="text-lg font-bold">Facility Distribution by State</h3>
                                <p className="text-sm text-muted-foreground">Showing facility counts across all states</p>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="state" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value, name, props) => [`${value} facilities`, props.payload.stateName]}
                                        contentStyle={{
                                            backgroundColor: "white",
                                            borderRadius: "6px",
                                            border: "1px solid #e2e8f0",
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#007bff" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="table">
                        <div className="border rounded-md overflow-hidden max-h-[500px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rank</TableHead>
                                        <TableHead>State</TableHead>
                                        <TableHead>State Code</TableHead>
                                        <TableHead className="text-right">Facility Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedStateSummaries.map((item, index) => (
                                        <TableRow key={item.state}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{stateNames[item.state] || "Unknown"}</TableCell>
                                            <TableCell>{item.state}</TableCell>
                                            <TableCell className="text-right">{item.count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
                <ReactTooltip id="facility-tooltip" place="top" />
            </CardContent>
        </Card>
    )
}
