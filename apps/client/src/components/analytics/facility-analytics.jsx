import { useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { MetricCards } from "./metric-cards"
import { CompanyChart } from "./company-chart"
import { StateChart } from "./state-chart"
import { CompanyPieChart } from "./company-pie-chart"
import { useSearch } from "../../contexts/search-context"

export function FacilityAnalytics() {
  const { filteredFacilities } = useSearch()

  // Process filtered data for analytics
  const analyticsData = useMemo(() => {
    // Company data
    const companyCount = {}

    filteredFacilities.forEach((facility) => {
      if (companyCount[facility.companyId]) {
        companyCount[facility.companyId].count++
      } else {
        companyCount[facility.companyId] = {
          name: facility.companyName,
          color: facility.color,
          count: 1,
        }
      }
    })

    const companyData = Object.entries(companyCount)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)

    // State data
    const stateCount = {}

    filteredFacilities.forEach((facility) => {
      stateCount[facility.state] = (stateCount[facility.state] || 0) + 1
    })

    const stateData = Object.entries(stateCount)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15) // Top 15 states

    // Metrics
    const totalFacilities = filteredFacilities.length
    const totalCompanies = companyData.length
    const topCompany = companyData[0]
    const averageFacilities = totalCompanies > 0 ? totalFacilities / totalCompanies : 0

    return {
      companyData,
      stateData,
      totalFacilities,
      totalCompanies,
      topCompany,
      averageFacilities,
    }
  }, [filteredFacilities])

  if (filteredFacilities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No facilities match your search criteria.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters to see results.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <MetricCards
        totalCompanies={analyticsData.totalCompanies}
        totalFacilities={analyticsData.totalFacilities}
        topCompany={analyticsData.topCompany}
        averageFacilities={analyticsData.averageFacilities}
      />

      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
        </TabsList>
        <TabsContent value="companies" className="space-y-4">
          <CompanyChart companies={analyticsData.companyData} />
        </TabsContent>
        <TabsContent value="states" className="space-y-4">
          <StateChart states={analyticsData.stateData} />
        </TabsContent>
      </Tabs>

      <CompanyPieChart companies={analyticsData.companyData} totalFacilities={analyticsData.totalFacilities} />
    </div>
  )
}
