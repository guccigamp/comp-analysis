import { useState } from "react"
import { Header } from "../components/Header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { MapIcon, ListIcon, BarChart3Icon } from "lucide-react"
import { MainMap } from "../components/map/MainMap"
import { List } from "../components/list/List"
import { FacilityAnalytics } from "../components/analytics/FacilityAnalytics"
import { SearchBar } from "../components/search/SearchBar"
import { ProximitySettings } from "../components/search/ProximitySettings"
import { AdvancedFilters } from "../components/search/AdvancedFilters"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("map")

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          {/* Global Search Component */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1">
                <SearchBar />
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <AdvancedFilters />
                <ProximitySettings />
              </div>
            </div>
          </div>

          <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapIcon className="h-4 w-4" />
                <span>Map View</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <ListIcon className="h-4 w-4" />
                <span>List View</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3Icon className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="border rounded-lg p-6 bg-card">
              <MainMap />
            </TabsContent>

            <TabsContent value="list" className="border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">List View</h2>
              <List />
            </TabsContent>

            <TabsContent value="analytics" className="border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">Analytics</h2>
              <FacilityAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
