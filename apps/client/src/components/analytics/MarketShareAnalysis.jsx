import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.jsx"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table.jsx"
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts"

export function MarketShareAnalysis({ facilities, companies }) {
    const [selectedRegion, setSelectedRegion] = useState("all")
    const [viewMode, setViewMode] = useState("pie")

    // Define regions
    const regions = useMemo(() => {
        return {
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
    }, [])

    // Filter facilities by region
    const filteredFacilities = useMemo(() => {
        if (selectedRegion === "all") return facilities

        const regionStates = regions[selectedRegion]?.states || []
        return facilities.filter((f) => regionStates.includes(f.state))
    }, [facilities, selectedRegion, regions])

    // Calculate market share by company
    const marketShareData = useMemo(() => {
        const companyMap = {}

        // Count facilities by company
        filteredFacilities.forEach((facility) => {
            if (!companyMap[facility.companyId]) {
                companyMap[facility.companyId] = {
                    id: facility.companyId,
                    name: facility.companyName,
                    color: facility.color,
                    count: 0,
                    states: new Set(),
                }
            }

            companyMap[facility.companyId].count++
            companyMap[facility.companyId].states.add(facility.state)
        })

        // Calculate percentages and sort by count
        const totalFacilitiesInRegion = filteredFacilities.length

        return Object.values(companyMap)
            .map((company) => ({
                ...company,
                percentage: totalFacilitiesInRegion > 0 ? (company.count / totalFacilitiesInRegion) * 100 : 0,
                stateCount: company.states.size,
            }))
            .sort((a, b) => b.count - a.count)
    }, [filteredFacilities])

    // Calculate market share by state
    const stateMarketShareData = useMemo(() => {
        const stateMap = {}

        // Group facilities by state
        filteredFacilities.forEach((facility) => {
            if (!stateMap[facility.state]) {
                stateMap[facility.state] = {
                    state: facility.state,
                    totalCount: 0,
                    companies: {},
                }
            }

            stateMap[facility.state].totalCount++

            if (!stateMap[facility.state].companies[facility.companyId]) {
                stateMap[facility.state].companies[facility.companyId] = {
                    id: facility.companyId,
                    name: facility.companyName,
                    color: facility.color,
                    count: 0,
                }
            }

            stateMap[facility.state].companies[facility.companyId].count++
        })

        // Calculate percentages for each company in each state
        Object.values(stateMap).forEach((stateData) => {
            Object.values(stateData.companies).forEach((company) => {
                company.percentage = (company.count / stateData.totalCount) * 100
            })

            // Sort companies by count
            stateData.companiesList = Object.values(stateData.companies).sort((a, b) => b.count - a.count)

            // Identify market leader
            stateData.marketLeader = stateData.companiesList[0] || null
        })

        return Object.values(stateMap).sort((a, b) => b.totalCount - a.totalCount)
    }, [filteredFacilities])

    // Format data for charts
    const pieChartData = useMemo(() => {
        return marketShareData.map((company) => ({
            name: company.name,
            value: company.count,
            color: company.color,
            percentage: company.percentage,
        }))
    }, [marketShareData])

    const barChartData = useMemo(() => {
        return stateMarketShareData
            .slice(0, 10) // Top 10 states
            .map((state) => {
                const data = { state: state.state }

                // Add top 5 companies for each state
                state.companiesList.slice(0, 5).forEach((company) => {
                    data[company.name] = company.count
                })

                return data
            })
    }, [stateMarketShareData])

    // Get colors for bar chart
    const barColors = useMemo(() => {
        const uniqueCompanies = new Set()
        const colorMap = {}

        stateMarketShareData.forEach((state) => {
            state.companiesList.slice(0, 5).forEach((company) => {
                if (!uniqueCompanies.has(company.name)) {
                    uniqueCompanies.add(company.name)
                    colorMap[company.name] = company.color
                }
            })
        })

        return colorMap
    }, [stateMarketShareData])

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            if (viewMode === "pie") {
                const data = payload[0].payload
                return (
                    <div className="bg-white p-3 border rounded shadow-sm">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm">Facilities: {data.value}</p>
                        <p className="text-sm">Market Share: {data.percentage.toFixed(1)}%</p>
                    </div>
                )
            }
            if (viewMode === "bar") {
                return (
                    <div className="bg-white p-3 border rounded shadow-sm">
                        <p className="font-medium">State: {label}</p>
                        {payload.map((item) => (
                            <p key={item.name} style={{ color: item.color }} className="text-sm">
                                {item.name}: {item.value} facilities
                            </p>
                        ))}
                    </div>
                )
            }
        }
        return null
    }

    // Pagination for market leaders
    const [page, setPage] = useState(1)
    const rowsPerPage = 10

    // Reset page when data changes
    useEffect(() => {
        setPage(1)
    }, [stateMarketShareData, selectedRegion])

    const totalPages = Math.max(1, Math.ceil(stateMarketShareData.length / rowsPerPage))

    const paginatedLeaders = useMemo(() => {
        const start = (page - 1) * rowsPerPage
        return stateMarketShareData.slice(start, start + rowsPerPage)
    }, [stateMarketShareData, page])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analyzing Company Market Share</CardTitle>
                <CardDescription>Graphical representation of market share by region and state</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Tabs wrapper starts */}
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                    {/* Row: region dropdown + tab triggers */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-2 block">Select Region</label>
                            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a region" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Regions</SelectItem>
                                    {Object.entries(regions).map(([key, region]) => (
                                        <SelectItem key={key} value={key}>
                                            {region.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full md:w-2/3 self-end">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="pie">Company Share (Pie)</TabsTrigger>
                                <TabsTrigger value="bar">State Share (Bar)</TabsTrigger>
                                <TabsTrigger value="table">Detailed Table</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    {/* Tab contents */}
                    <TabsContent value="pie" className="mt-0">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium">Company Market Share Distribution</h3>
                            <p className="text-sm text-muted-foreground">Interactive pie chart showing the relative market share of each company in the selected region</p>
                        </div>
                        <div className="h-[500px]">
                            {pieChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted-foreground text-center pt-20">No data available for the selected region.</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="bar" className="mt-0">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium">State-by-State Facility Distribution</h3>
                            <p className="text-sm text-muted-foreground">Bar chart comparing facility counts across states for each company</p>
                        </div>
                        <div className="h-[500px]">
                            {barChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="state" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        {Object.keys(barColors).map((companyName) => (
                                            <Bar key={companyName} dataKey={companyName} fill={barColors[companyName]} />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted-foreground text-center pt-20">No data available for the selected region.</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="table" className="mt-0">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium">Comprehensive Market Share Analysis</h3>
                            <p className="text-sm text-muted-foreground">Detailed breakdown of facility counts, market share percentages, and state coverage for each company</p>
                        </div>
                        <div className="border rounded-md overflow-hidden max-h-[500px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Company</TableHead>
                                        <TableHead className="text-right">Facility Count</TableHead>
                                        <TableHead className="text-right">Market Share (%)</TableHead>
                                        <TableHead className="text-right">States Covered</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {marketShareData.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell>
                                                <span className="inline-flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: company.color }} />
                                                    {company.name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">{company.count}</TableCell>
                                            <TableCell className="text-right">{company.percentage.toFixed(1)}</TableCell>
                                            <TableCell className="text-right">{company.stateCount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-8 mb-4">
                    <h3 className="text-lg font-medium">Market Leaders by State</h3>
                    <p className="text-sm text-muted-foreground">State-by-state breakdown showing dominant companies and their market control</p>
                </div>
                <div className="border rounded-md overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>State</TableHead>
                                <TableHead>Market Leader</TableHead>
                                <TableHead className="text-right">Leader's Share (%)</TableHead>
                                <TableHead className="text-right">Total Facilities</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedLeaders.length > 0 ? (
                                paginatedLeaders.map((stateData) => (
                                    <TableRow key={stateData.state}>
                                        <TableCell>{stateData.state}</TableCell>
                                        <TableCell>
                                            {stateData.marketLeader ? (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: stateData.marketLeader.color }}
                                                    />
                                                    {stateData.marketLeader.name}
                                                </div>
                                            ) : (
                                                "N/A"
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {stateData.marketLeader ? `${stateData.marketLeader.percentage.toFixed(2)}%` : "N/A"}
                                        </TableCell>
                                        <TableCell className="text-right">{stateData.totalCount}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">
                                        No state data available for the selected region.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 py-4">
                            <button
                                className="px-3 py-1 border rounded disabled:opacity-50"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Prev
                            </button>
                            <span className="text-sm">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                className="px-3 py-1 border rounded disabled:opacity-50"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
