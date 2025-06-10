import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { MetricCards } from "./MetricCards"
import { CompanyChart } from "./CompanyChart"
import { StateChart } from "./StateChart"
import { CompanyPieChart } from "./CompanyPieChart"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "../ui/button"
import { companyApi } from "../../lib/api"
import { transformCompanyData, getCompanySummaries, getStateSummaries } from "../../utils/facility-utils"

export function FacilityAnalytics() {
  const [companies, setCompanies] = useState([])
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get all companies with their facilities for analytics
        const response = await companyApi.getAllCompanies()
        const transformedCompanies = transformCompanyData(response.data)

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
    setLoading(true)
    setError(null)

    // Re-fetch data
    companyApi
      .getAllCompanies()
      .then((response) => {
        const transformedCompanies = transformCompanyData(response.data)
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
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error refreshing analytics data:", err)
        setError("Failed to refresh analytics data")
        setLoading(false)
      })
  }

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

  // Prepare data for charts
  const companySummaries = getCompanySummaries(companies)
  const stateSummaries = getStateSummaries(facilities)
  const totalFacilities = facilities.length
  const totalCompanies = companies.length
  const averageFacilitiesPerCompany = totalCompanies > 0 ? totalFacilities / totalCompanies : 0

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
          averageFacilitiesPerCompany={averageFacilitiesPerCompany}
        />

        <Tabs defaultValue="companies" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="states">States</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
          <TabsContent value="companies" className="pt-4">
            <CompanyChart companySummaries={companySummaries} />
          </TabsContent>
          <TabsContent value="states" className="pt-4">
            <StateChart stateSummaries={stateSummaries} />
          </TabsContent>
          <TabsContent value="distribution" className="pt-4">
            <CompanyPieChart companySummaries={companySummaries} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
