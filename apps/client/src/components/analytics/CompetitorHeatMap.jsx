import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.jsx"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { scaleQuantize } from "d3-scale"
import { APIProvider, Map as GoogleMapComponent } from "@vis.gl/react-google-maps"
import { MarkerPin } from "../map/MarkerPin.jsx"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table.jsx"

// US States GeoJSON
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"

export function CompetitorHeatMap({ facilities, companies }) {
    const [selectedCompany, setSelectedCompany] = useState(companies[0]?.id || "")
    const [viewMode, setViewMode] = useState("map")

    // Get state abbreviations from full names for mapping
    const stateAbbreviations = {
        Alabama: "AL",
        Alaska: "AK",
        Arizona: "AZ",
        Arkansas: "AR",
        California: "CA",
        Colorado: "CO",
        Connecticut: "CT",
        Delaware: "DE",
        Florida: "FL",
        Georgia: "GA",
        Hawaii: "HI",
        Idaho: "ID",
        Illinois: "IL",
        Indiana: "IN",
        Iowa: "IA",
        Kansas: "KS",
        Kentucky: "KY",
        Louisiana: "LA",
        Maine: "ME",
        Maryland: "MD",
        Massachusetts: "MA",
        Michigan: "MI",
        Minnesota: "MN",
        Mississippi: "MS",
        Missouri: "MO",
        Montana: "MT",
        Nebraska: "NE",
        Nevada: "NV",
        "New Hampshire": "NH",
        "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        "North Carolina": "NC",
        "North Dakota": "ND",
        Ohio: "OH",
        Oklahoma: "OK",
        Oregon: "OR",
        Pennsylvania: "PA",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "South Dakota": "SD",
        Tennessee: "TN",
        Texas: "TX",
        Utah: "UT",
        Vermont: "VT",
        Virginia: "VA",
        Washington: "WA",
        "West Virginia": "WV",
        Wisconsin: "WI",
        Wyoming: "WY",
        "District of Columbia": "DC",
    }

    // Reverse mapping for display
    const stateNames = Object.entries(stateAbbreviations).reduce((acc, [name, abbr]) => {
        acc[abbr] = name
        return acc
    }, {})

    // Get company data
    const companyData = useMemo(() => {
        return companies.find((c) => c.id === selectedCompany) || companies[0] || null
    }, [companies, selectedCompany])

    // Get competitor facilities
    const competitorFacilities = useMemo(() => {
        if (!companyData) return []
        return facilities.filter((f) => f.companyId !== companyData.id)
    }, [facilities, companyData])

    // Get company facilities
    const companyFacilities = useMemo(() => {
        if (!companyData) return []
        return facilities.filter((f) => f.companyId === companyData.id)
    }, [facilities, companyData])

    // Calculate competitor density by state
    const competitorDensity = useMemo(() => {
        if (!companyData) return {}

        const density = {}
        const companyStates = new Set(companyFacilities.map((f) => f.state))

        // Count competitors in each state
        competitorFacilities.forEach((facility) => {
            if (!density[facility.state]) {
                density[facility.state] = {
                    state: facility.state,
                    competitors: 0,
                    companyPresence: companyStates.has(facility.state),
                    competitorsByCompany: {},
                }
            }

            density[facility.state].competitors++

            if (!density[facility.state].competitorsByCompany[facility.companyId]) {
                density[facility.state].competitorsByCompany[facility.companyId] = {
                    companyId: facility.companyId,
                    companyName: facility.companyName,
                    color: facility.color,
                    count: 0,
                }
            }

            density[facility.state].competitorsByCompany[facility.companyId].count++
        })

        // Add states where the company has presence but no competitors
        companyStates.forEach((state) => {
            if (!density[state]) {
                density[state] = {
                    state,
                    competitors: 0,
                    companyPresence: true,
                    competitorsByCompany: {},
                }
            }
        })

        return density
    }, [companyData, companyFacilities, competitorFacilities])

    // Format data for the map
    const mapData = useMemo(() => {
        const data = {}
        Object.values(competitorDensity).forEach(({ state, competitors }) => {
            data[state] = competitors
        })
        return data
    }, [competitorDensity])

    // Color scale for the map
    const colorScale = scaleQuantize()
        .domain([0, Math.max(...Object.values(mapData), 1)])
        .range([
            "#e6f2ff",
            "#cce5ff",
            "#99caff",
            "#66b0ff",
            "#3395ff",
            "#0077ff",
            "#0066cc",
            "#0055aa",
            "#004488",
            "#003366",
        ])

    // Format data for the table
    const tableData = useMemo(() => {
        return Object.values(competitorDensity)
            .map((data) => ({
                ...data,
                competitorsList: Object.values(data.competitorsByCompany).sort((a, b) => b.count - a.count),
            }))
            .sort((a, b) => b.competitors - a.competitors)
    }, [competitorDensity])

    // Calculate map center based on company facilities
    const mapCenter = useMemo(() => {
        if (companyFacilities.length === 0) {
            return { lat: 39.8283, lng: -98.5795 } // US center
        }

        const totalLat = companyFacilities.reduce((sum, f) => sum + f.latitude, 0)
        const totalLng = companyFacilities.reduce((sum, f) => sum + f.longitude, 0)

        return {
            lat: totalLat / companyFacilities.length,
            lng: totalLng / companyFacilities.length,
        }
    }, [companyFacilities])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
                <CardDescription>Analyze competitor presence relative to your facilities</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Tabs wrapper starts */}
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-2 block">Select Your Company</label>
                            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full md:w-2/3">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="map">Heat Map</TabsTrigger>
                                <TabsTrigger value="table">Competitor Table</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    <TabsContent value="map" className="mt-0">
                        <div className="h-[1000px] border rounded-md p-4 bg-white">
                            <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 1000 }}>
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) =>
                                        geographies.map((geo) => {
                                            const stateName = geo.properties.name
                                            const stateCode = stateAbbreviations[stateName] || stateName // Use the full name to get the abbreviation
                                            const count = mapData[stateCode] || 0
                                            const hasCompanyPresence = competitorDensity[stateCode]?.companyPresence

                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    fill={count > 0 ? colorScale(count) : "#EEE"}
                                                    stroke={hasCompanyPresence ? "#FF5733" : "#FFF"}
                                                    strokeWidth={hasCompanyPresence ? 3 : 1}
                                                    style={{
                                                        default: { outline: "none" },
                                                        hover: { outline: "none", fill: "#0066ff" },
                                                        pressed: { outline: "none" },
                                                    }}
                                                />
                                            )
                                        })
                                    }
                                </Geographies>
                            </ComposableMap>

                            {/* Legend */}
                            <div className="flex justify-center mt-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-1">
                                            {colorScale.range().map((color, i) => (
                                                <div key={i} style={{ backgroundColor: color }} className="w-6 h-4" />
                                            ))}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            <span>Fewer</span>
                                            <span className="mx-2">→</span>
                                            <span>More Competitors</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <div className="w-6 h-4 border-2 border-[#FF5733]"></div>
                                        <div className="text-xs text-muted-foreground">
                                            <span>Your Company Presence</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="table" className="mt-0">
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>State</TableHead>
                                        <TableHead className="text-right">Competitor Count</TableHead>
                                        <TableHead>Your Presence</TableHead>
                                        <TableHead>Top Competitors</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tableData.map((data) => (
                                        <TableRow key={data.state}>
                                            <TableCell>
                                                {stateNames[data.state] || data.state}
                                                <span className="text-xs text-muted-foreground ml-1">({data.state})</span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{data.competitors}</TableCell>
                                            <TableCell>
                                                {data.companyPresence ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                        No
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {data.competitorsList.slice(0, 3).map((competitor) => (
                                                        <span
                                                            key={competitor.companyId}
                                                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                                            style={{
                                                                backgroundColor: `${competitor.color}20`,
                                                                color: competitor.color,
                                                            }}
                                                        >
                                                            {competitor.companyName} ({competitor.count})
                                                        </span>
                                                    ))}
                                                    {data.competitorsList.length > 3 && (
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                                            +{data.competitorsList.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {tableData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4">
                                                No competitor data available
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
