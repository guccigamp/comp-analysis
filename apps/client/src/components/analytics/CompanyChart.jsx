import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

export function CompanyChart({ companySummaries }) {
  if (!companySummaries || companySummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facilities by Company</CardTitle>
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
        <CardTitle>Facilities by Company</CardTitle>
        <CardDescription>Distribution of facilities across companies</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={companySummaries}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 120,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => [`${value} facilities`, props.payload.name]}
                contentStyle={{ backgroundColor: "white", borderRadius: "6px", border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="facilityCount">
                {companySummaries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
