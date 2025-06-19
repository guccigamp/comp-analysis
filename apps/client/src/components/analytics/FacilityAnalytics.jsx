import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.jsx"
import { MetricCards } from "./MetricCards.jsx"
import { StateHeatMap } from "./StateHeatMap.jsx"
import { CompetitorHeatMap } from "./CompetitorHeatMap.jsx"
import { MarketShareAnalysis } from "./MarketShareAnalysis.jsx"
import { TagAnalysis } from "./TagAnalysis.jsx"
import { Loader2, AlertCircle, RefreshCw, Map, PieChart, Tag, BarChart3 } from "lucide-react"
import { Button } from "../ui/button.jsx"
import { companyApi, facilityApi } from "../../lib/api.js"
import { transformCompanyData, getCompanySummaries, getStateSummaries } from "../../utils/facility-utils.js"

export function FacilityAnalytics() {
  const [companies, setCompanies] = useState([])
  const [facilities, setFacilities] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get all companies with their facilities for analytics
        const [companiesResponse, tagsResponse] = await Promise.all([
          companyApi.getAllCompanies(),
          facilityApi.getUniqueTags(),
        ])

        const transformedCompanies = transformCompanyData(companiesResponse.data)
        const tagsList = tagsResponse.data.map((tagObj) => tagObj.tag) || []

        // Extract all facilities from companies
        const allFacilities = transformedCompanies.flatMap((company) =>
          company.facilities.map((facility) => ({
            ...facility,
            companyId: company.id,
            companyName: company.name,
            color: company.color,
          })),
        )

        setCompanies(transformedCompanies)
        setFacilities(allFacilities)
        setTags(tagsList)
      } catch (err) {
        console.error("Error loading analytics data:", err)
        setError("Failed to load analytics data")
      } finally {
        setLoading(false)
      }
    }

    loadAnalyticsData()
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    setCompanies([])
    setFacilities([])
    setTags([])
    setLoading(true)
    setError(null)

    // Re-fetch data
    Promise.all([companyApi.getAllCompanies(), facilityApi.getUniqueTags()])
      .then(([companiesResponse, tagsResponse]) => {
        const transformedCompanies = transformCompanyData(companiesResponse.data)
        const tagsList = tagsResponse.data.map((tagObj) => tagObj.tag) || []

        const allFacilities = transformedCompanies.flatMap((company) =>
          company.facilities.map((facility) => ({
            ...facility,
            companyId: company.id,
            companyName: company.name,
            color: company.color,
          })),
        )

        setCompanies(transformedCompanies)
        setFacilities(allFacilities)
        setTags(tagsList)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error refreshing analytics data:", err)
        setError("Failed to refresh analytics data")
        setLoading(false)
      })
  }

  // Prepare data for metrics
  const companySummaries = useMemo(() => getCompanySummaries(companies), [companies])
  const stateSummaries = useMemo(() => getStateSummaries(facilities), [facilities])
  const totalFacilities = facilities.length
  const totalCompanies = companies.length
  const averageFacilitiesPerCompany = totalCompanies > 0 ? totalFacilities / totalCompanies : 0
  const topCompany = companySummaries.length > 0 ? companySummaries[0] : null

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading analytics...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Facility Analytics</CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <MetricCards
          totalFacilities={totalFacilities}
          totalCompanies={totalCompanies}
          topCompany={topCompany}
          averageFacilities={averageFacilitiesPerCompany}
        />

        <Tabs defaultValue="state-map" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="state-map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">State Distribution</span>
              <span className="sm:hidden">States</span>
            </TabsTrigger>
            <TabsTrigger value="competitors" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Competitor Analysis</span>
              <span className="sm:hidden">Competitors</span>
            </TabsTrigger>
            <TabsTrigger value="market-share" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Market Share</span>
              <span className="sm:hidden">Market</span>
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Tag Analysis</span>
              <span className="sm:hidden">Tags</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="state-map" className="pt-4">
            <StateHeatMap facilities={facilities} stateSummaries={stateSummaries} />
          </TabsContent>

          <TabsContent value="competitors" className="pt-4">
            <CompetitorHeatMap facilities={facilities} companies={companies} />
          </TabsContent>

          <TabsContent value="market-share" className="pt-4">
            <MarketShareAnalysis facilities={facilities} companies={companies} />
          </TabsContent>

          <TabsContent value="tags" className="pt-4">
            <TagAnalysis facilities={facilities} tags={tags} companies={companies} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
