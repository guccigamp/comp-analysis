import { useMemo, useState } from "react"
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Market Share Analysis</CardTitle>
                <CardDescription>Analyze market share by region and state</CardDescription>
            </CardHeader>
            <CardContent>
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

                    <div className="w-full md:w-2/3">
                        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="pie">Company Share (Pie)</TabsTrigger>
                                <TabsTrigger value="bar">State Share (Bar)</TabsTrigger>
                                <TabsTrigger value="table">Detailed Table</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <TabsContent value="pie" className="mt-0">
                    <div className="h-[500px]">
                        {pieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                                        outerRadius={150}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No data available for the selected region.
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="bar" className="mt-0">
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
                                        <Bar key={companyName} dataKey={companyName} stackId="a" fill={barColors[companyName]} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No data available for the selected region.
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="table" className="mt-0">
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead className="text-right">Facility Count</TableHead>
                                    <TableHead className="text-right">Market Share (%)</TableHead>
                                    <TableHead className="text-right">States Present</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {marketShareData.length > 0 ? (
                                    marketShareData.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: company.color }} />
                                                    {company.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{company.count}</TableCell>
                                            <TableCell className="text-right">{company.percentage.toFixed(2)}%</TableCell>
                                            <TableCell className="text-right">{company.stateCount}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">
                                            No data available for the selected region.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <h3 className="font-medium text-lg mt-6 mb-3">Market Leaders by State</h3>
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
                                {stateMarketShareData.length > 0 ? (
                                    stateMarketShareData.map((stateData) => (
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
                    </div>
                </TabsContent>
            </CardContent>
        </Card>
    )
}
