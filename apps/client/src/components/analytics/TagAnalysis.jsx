import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function TagAnalysis({ facilities, tags, companies }) {
    const [selectedTag, setSelectedTag] = useState("all")

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
                    {payload
                        .filter((item) => item.value && item.value > 0)
                        .map((item) => (
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
                <CardTitle>Analyzing Facility Distribution by Tags</CardTitle>
                <CardDescription>Interactive bar chart showing facility distribution by tags</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={companyBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" height={80} tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" align="center" height={36} />
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
            </CardContent>
        </Card>
    )
}
