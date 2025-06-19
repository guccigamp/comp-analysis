
import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.jsx"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table.jsx"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { APIProvider, Map as GoogleMapComponent } from "@vis.gl/react-google-maps"
import { MarkerPin } from "../map/MarkerPin.jsx"
import { ProximityCircle } from "../map/ProximityCircle.jsx"

// Haversine formula to calculate distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

// Convert km to miles
function kmToMiles(km) {
    return km * 0.621371
}

export function ProximityAnalysis({ facilities, companies }) {
    const [selectedCompany, setSelectedCompany] = useState("all")
    const [viewMode, setViewMode] = useState("map")
    const [selectedPair, setSelectedPair] = useState(null)

    // Calculate proximity data between facilities
    const proximityData = useMemo(() => {
        if (!facilities || facilities.length === 0) return []

        const filteredFacilities =
            selectedCompany === "all" ? facilities : facilities.filter((f) => f.companyId === selectedCompany)

        if (filteredFacilities.length <= 1) return []

        const pairs = []

        // Calculate distances between facilities of the same company
        for (let i = 0; i < filteredFacilities.length; i++) {
            const facility1 = filteredFacilities[i]

            for (let j = i + 1; j < filteredFacilities.length; j++) {
                const facility2 = filteredFacilities[j]

                // Skip if they're from different companies in single-company mode
                if (selectedCompany !== "all" && facility1.companyId !== facility2.companyId) continue

                // Calculate distance
                const distanceKm = calculateDistance(
                    facility1.latitude,
                    facility1.longitude,
                    facility2.latitude,
                    facility2.longitude,
                )

                const distanceMiles = kmToMiles(distanceKm)

                pairs.push({
                    id: `${facility1.id}-${facility2.id}`,
                    facility1,
                    facility2,
                    distanceKm: Number.parseFloat(distanceKm.toFixed(2)),
                    distanceMiles: Number.parseFloat(distanceMiles.toFixed(2)),
                    sameCompany: facility1.companyId === facility2.companyId,
                })
            }
        }

        // Sort by distance
        return pairs.sort((a, b) => a.distanceMiles - b.distanceMiles)
    }, [facilities, selectedCompany])

    // Get nearest pairs for each company
    const nearestPairsByCompany = useMemo(() => {
        if (!facilities || facilities.length === 0) return []

        const companyMap = {}

        companies.forEach((company) => {
            const companyFacilities = facilities.filter((f) => f.companyId === company.id)

            if (companyFacilities.length <= 1) {
                companyMap[company.id] = {
                    companyId: company.id,
                    companyName: company.name,
                    color: company.color,
                    nearestPair: null,
                    averageDistance: null,
                    facilityCount: companyFacilities.length,
                }
                return
            }

            let minDistance = Number.POSITIVE_INFINITY
            let nearestPair = null
            let totalDistance = 0
            let pairCount = 0

            for (let i = 0; i < companyFacilities.length; i++) {
                const facility1 = companyFacilities[i]

                for (let j = i + 1; j < companyFacilities.length; j++) {
                    const facility2 = companyFacilities[j]

                    const distanceKm = calculateDistance(
                        facility1.latitude,
                        facility1.longitude,
                        facility2.latitude,
                        facility2.longitude,
                    )

                    const distanceMiles = kmToMiles(distanceKm)

                    totalDistance += distanceMiles
                    pairCount++

                    if (distanceMiles < minDistance) {
                        minDistance = distanceMiles
                        nearestPair = {
                            facility1,
                            facility2,
                            distanceMiles: Number.parseFloat(distanceMiles.toFixed(2)),
                        }
                    }
                }
            }

            companyMap[company.id] = {
                companyId: company.id,
                companyName: company.name,
                color: company.color,
                nearestPair,
                averageDistance: pairCount > 0 ? Number.parseFloat((totalDistance / pairCount).toFixed(2)) : null,
                facilityCount: companyFacilities.length,
            }
        })

        return Object.values(companyMap)
            .filter((item) => item.facilityCount > 1)
            .sort(
                (a, b) =>
                    (a.nearestPair?.distanceMiles || Number.POSITIVE_INFINITY) -
                    (b.nearestPair?.distanceMiles || Number.POSITIVE_INFINITY),
            )
    }, [facilities, companies])

    // Format data for scatter plot
    const scatterData = useMemo(() => {
        return nearestPairsByCompany.map((company) => ({
            x: company.facilityCount,
            y: company.averageDistance,
            z: company.nearestPair?.distanceMiles || 0,
            name: company.companyName,
            color: company.color,
        }))
    }, [nearestPairsByCompany])

    // Map center and zoom for selected pair
    const mapConfig = useMemo(() => {
        if (!selectedPair) {
            // Default to US center
            return {
                center: { lat: 39.8283, lng: -98.5795 },
                zoom: 4,
            }
        }

        const { facility1, facility2 } = selectedPair

        // Calculate center point between the two facilities
        const centerLat = (facility1.latitude + facility2.latitude) / 2
        const centerLng = (facility1.longitude + facility2.longitude) / 2

        // Calculate appropriate zoom level based on distance
        let zoom = 10
        if (selectedPair.distanceMiles > 100) zoom = 5
        else if (selectedPair.distanceMiles > 50) zoom = 6
        else if (selectedPair.distanceMiles > 20) zoom = 7
        else if (selectedPair.distanceMiles > 10) zoom = 8
        else if (selectedPair.distanceMiles > 5) zoom = 9

        return {
            center: { lat: centerLat, lng: centerLng },
            zoom,
        }
    }, [selectedPair])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Proximity Analysis</CardTitle>
                <CardDescription>Analyze distances between facilities</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-2 block">Select Company</label>
                            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Companies</SelectItem>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full md:w-2/3">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="map">Map View</TabsTrigger>
                                <TabsTrigger value="table">Nearest Pairs</TabsTrigger>
                                <TabsTrigger value="chart">Distance Analysis</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    <TabsContent value="map" className="mt-0">
                        <div className="border rounded-lg overflow-hidden h-[500px] relative">
                            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API || ""}>
                                <GoogleMapComponent
                                    center={mapConfig.center}
                                    zoom={mapConfig.zoom}
                                    mapId={import.meta.env.VITE_MAP_ID}
                                    style={{ width: "100%", height: "100%" }}
                                    options={{ fullscreenControl: true }}
                                >
                                    {selectedPair ? (
                                        <>
                                            <MarkerPin
                                                facilities={[selectedPair.facility1, selectedPair.facility2]}
                                                selectedFacility={null}
                                            />
                                            <ProximityCircle
                                                center={{ lat: selectedPair.facility1.latitude, lng: selectedPair.facility1.longitude }}
                                                radius={selectedPair.distanceKm}
                                                unit="kilometers"
                                            />
                                        </>
                                    ) : (
                                        <MarkerPin
                                            facilities={
                                                selectedCompany === "all"
                                                    ? facilities
                                                    : facilities.filter((f) => f.companyId === selectedCompany)
                                            }
                                            selectedFacility={null}
                                        />
                                    )}
                                </GoogleMapComponent>
                            </APIProvider>

                            {selectedPair && (
                                <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-md shadow-md">
                                    <h3 className="font-medium text-sm mb-1">Selected Pair</h3>
                                    <div className="text-xs space-y-1">
                                        <p>
                                            <span className="font-medium">Distance:</span> {selectedPair.distanceMiles.toFixed(2)} miles (
                                            {selectedPair.distanceKm.toFixed(2)} km)
                                        </p>
                                        <p>
                                            <span className="font-medium">Facility 1:</span>{" "}
                                            {selectedPair.facility1.name || selectedPair.facility1.address}
                                        </p>
                                        <p>
                                            <span className="font-medium">Facility 2:</span>{" "}
                                            {selectedPair.facility2.name || selectedPair.facility2.address}
                                        </p>
                                        <p>
                                            <span className="font-medium">Company:</span> {selectedPair.facility1.companyName}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <h3 className="font-medium text-sm mb-2">Nearest Facility Pairs</h3>
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Facility 1</TableHead>
                                            <TableHead>Facility 2</TableHead>
                                            <TableHead className="text-right">Distance (miles)</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {proximityData.slice(0, 5).map((pair) => (
                                            <TableRow key={pair.id} className={selectedPair?.id === pair.id ? "bg-muted" : ""}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pair.facility1.color }} />
                                                        {pair.facility1.companyName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{pair.facility1.name || pair.facility1.address}</TableCell>
                                                <TableCell>{pair.facility2.name || pair.facility2.address}</TableCell>
                                                <TableCell className="text-right">{pair.distanceMiles.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <button
                                                        className="text-xs text-blue-600 hover:underline"
                                                        onClick={() => setSelectedPair(pair)}
                                                    >
                                                        View
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="table" className="mt-0">
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rank</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Nearest Pair</TableHead>
                                        <TableHead className="text-right">Distance (miles)</TableHead>
                                        <TableHead className="text-right">Avg Distance (miles)</TableHead>
                                        <TableHead className="text-right">Facility Count</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {nearestPairsByCompany.map((company, index) => (
                                        <TableRow key={company.companyId}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: company.color }} />
                                                    {company.companyName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {company.nearestPair ? (
                                                    <span className="text-xs">
                                                        {company.nearestPair.facility1.name ||
                                                            company.nearestPair.facility1.address.substring(0, 20)}
                                                        {" → "}
                                                        {company.nearestPair.facility2.name ||
                                                            company.nearestPair.facility2.address.substring(0, 20)}
                                                    </span>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {company.nearestPair?.distanceMiles.toFixed(2) || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right">{company.averageDistance?.toFixed(2) || "N/A"}</TableCell>
                                            <TableCell className="text-right">{company.facilityCount}</TableCell>
                                            <TableCell>
                                                {company.nearestPair && (
                                                    <button
                                                        className="text-xs text-blue-600 hover:underline"
                                                        onClick={() => {
                                                            const pair = {
                                                                id: `${company.nearestPair.facility1.id}-${company.nearestPair.facility2.id}`,
                                                                facility1: company.nearestPair.facility1,
                                                                facility2: company.nearestPair.facility2,
                                                                distanceMiles: company.nearestPair.distanceMiles,
                                                                distanceKm: company.nearestPair.distanceMiles / 0.621371,
                                                            }
                                                            setSelectedPair(pair)
                                                            setViewMode("map")
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="chart" className="mt-0">
                        <div className="h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid />
                                    <XAxis
                                        type="number"
                                        dataKey="x"
                                        name="Facility Count"
                                        label={{ value: "Number of Facilities", position: "bottom", offset: 0 }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="y"
                                        name="Average Distance"
                                        label={{ value: "Average Distance (miles)", angle: -90, position: "left" }}
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: "3 3" }}
                                        formatter={(value, name, props) => {
                                            if (name === "Facility Count") return [value, name]
                                            if (name === "Average Distance") return [`${value.toFixed(2)} miles`, name]
                                            return [value, name]
                                        }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-white p-3 border rounded shadow-sm">
                                                        <p className="font-medium">{data.name}</p>
                                                        <p className="text-sm">Facilities: {data.x}</p>
                                                        <p className="text-sm">Avg Distance: {data.y?.toFixed(2)} miles</p>
                                                        <p className="text-sm">Nearest Pair: {data.z?.toFixed(2)} miles</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Scatter name="Companies" data={scatterData}>
                                        {scatterData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center text-sm text-muted-foreground mt-4">
                            This chart shows the relationship between the number of facilities and the average distance between them
                            for each company.
                            <br />
                            Companies with more facilities tend to have greater average distances between them.
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
