import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

export function CompanyPieChart({ companySummaries, totalFacilities }) {
  if (!companySummaries || companySummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Distribution</CardTitle>
          <CardDescription>No company data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Distribution</CardTitle>
        <CardDescription>Proportion of facilities by company</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={companySummaries}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="facilityCount"
              >
                {companySummaries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} facilities (${((value / (totalFacilities || 1)) * 100).toFixed(1)}%)`,
                  props.payload.name,
                ]}
                contentStyle={{ backgroundColor: "white", borderRadius: "6px", border: "1px solid #e2e8f0" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
