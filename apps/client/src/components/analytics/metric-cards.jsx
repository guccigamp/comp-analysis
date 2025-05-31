import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export function MetricCards({ totalCompanies, totalFacilities, topCompany, averageFacilities }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCompanies}</div>
          <p className="text-xs text-muted-foreground">Companies in the database</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFacilities}</div>
          <p className="text-xs text-muted-foreground">Facilities across all companies</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Largest Company</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topCompany?.name}</div>
          <p className="text-xs text-muted-foreground">{topCompany?.count} facilities</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageFacilities.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Facilities per company</p>
        </CardContent>
      </Card>
    </div>
  )
}
