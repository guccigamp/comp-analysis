import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.jsx"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table.jsx"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function TagAnalysis({ facilities, tags, companies }) {
    const [selectedTag, setSelectedTag] = useState("all")
    const [viewMode, setViewMode] = useState("overview")

    // Memoized calculation for tag counts across all facilities
    const tagCounts = useMemo(() => {
        const counts = {}
        facilities.forEach((facility) => {
            facility.tags?.forEach((tag) => {
                counts[tag] = (counts[tag] || 0) + 1
            })
        })
        return Object.entries(counts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
    }, [facilities])

    // Memoized calculation for company breakdown
    const companyBreakdown = useMemo(() => {
        const companyMap = {}
        const topTags = new Set(tagCounts.slice(0, 7).map((t) => t.tag))

        companies.forEach((company) => {
            companyMap[company.name] = {
                name: company.name,
                color: company.color,
                total: 0,
                Other: 0,
            }
            topTags.forEach((tag) => {
                companyMap[company.name][tag] = 0
            })
        })

        facilities.forEach((facility) => {
            if (companyMap[facility.companyName]) {
                facility.tags?.forEach((tag) => {
                    if (topTags.has(tag)) {
                        companyMap[facility.companyName][tag]++
                    } else {
                        companyMap[facility.companyName].Other++
                    }
                    companyMap[facility.companyName].total++
                })
            }
        })

        return Object.values(companyMap).sort((a, b) => b.total - a.total)
    }, [facilities, companies, tagCounts])

    // Memoized calculation for geographic distribution of a selected tag
    const geoDistribution = useMemo(() => {
        if (selectedTag === "all") return []

        const stateCounts = {}
        facilities.forEach((facility) => {
            if (facility.tags?.includes(selectedTag)) {
                stateCounts[facility.state] = (stateCounts[facility.state] || 0) + 1
            }
        })

        return Object.entries(stateCounts)
            .map(([state, count]) => ({ state, count }))
            .sort((a, b) => b.count - a.count)
    }, [facilities, selectedTag])

    const topTagsForLegend = useMemo(() => tagCounts.slice(0, 7).map((t) => t.tag), [tagCounts])

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded shadow-sm">
                    <p className="font-medium">{label}</p>
                    {payload.map((item) => (
                        <p key={item.name} style={{ color: item.color }} className="text-sm">
                            {item.name}: {item.value}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tag Analysis</CardTitle>
                <CardDescription>Analyze facility distribution based on tags</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="w-full md:w-1/3">
                        <label className="text-sm font-medium mb-2 block">Analyze a Specific Tag</label>
                        <Select
                            value={selectedTag}
                            onValueChange={(value) => {
                                setSelectedTag(value)
                                // Switch to geo view if a specific tag is selected from overview
                                if (value !== "all" && viewMode === "overview") {
                                    setViewMode("geography")
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a tag" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tags (Overview)</SelectItem>
                                {tags.map((tag) => (
                                    <SelectItem key={tag} value={tag}>
                                        {tag}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full md:w-2/3">
                        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview">Tag Overview</TabsTrigger>
                                <TabsTrigger value="companies">By Company</TabsTrigger>
                                <TabsTrigger value="geography" disabled={selectedTag === "all"}>
                                    By Geography
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <TabsContent value="overview" className="mt-0">
                    <div className="h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={tagCounts.slice(0, 20)}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="tag" width={120} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => [`${value} facilities`, "Count"]} />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>

                <TabsContent value="companies" className="mt-0">
                    <div className="h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={companyBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                {topTagsForLegend.map((tag, index) => (
                                    <Bar
                                        key={tag}
                                        dataKey={tag}
                                        stackId="a"
                                        fill={companies[index % companies.length]?.color || "#8884d8"}
                                    />
                                ))}
                                <Bar dataKey="Other" stackId="a" fill="#b0b0b0" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>

                <TabsContent value="geography" className="mt-0">
                    {selectedTag === "all" ? (
                        <div className="flex items-center justify-center h-[500px] text-muted-foreground bg-gray-50 rounded-md">
                            <p>Please select a specific tag to see its geographic distribution.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-[500px]">
                                <h3 className="font-medium text-center mb-2">Top States for "{selectedTag}"</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={geoDistribution.slice(0, 15)}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="state" width={40} />
                                        <Tooltip formatter={(value) => [`${value} facilities`, "Count"]} />
                                        <Bar dataKey="count" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="border rounded-md overflow-hidden h-[500px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>State</TableHead>
                                            <TableHead className="text-right">Facility Count</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {geoDistribution.length > 0 ? (
                                            geoDistribution.map((item) => (
                                                <TableRow key={item.state}>
                                                    <TableCell>{item.state}</TableCell>
                                                    <TableCell className="text-right">{item.count}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center py-4">
                                                    No facilities found with this tag.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </CardContent>
        </Card>
    )
}
