import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export function MetricCards({ totalCompanies, totalFacilities, topCompany, averageFacilities }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCompanies || 0}</div>
          <p className="text-xs text-muted-foreground">Companies in the database</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFacilities || 0}</div>
          <p className="text-xs text-muted-foreground">Facilities across all companies</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Largest Company</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topCompany?.name || "N/A"}</div>
          <p className="text-xs text-muted-foreground">{topCompany?.count || 0} facilities</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageFacilities ? averageFacilities.toFixed(1) : "0.0"}</div>
          <p className="text-xs text-muted-foreground">Facilities per company</p>
        </CardContent>
      </Card>
    </div>
  )
}
