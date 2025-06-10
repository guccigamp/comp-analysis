import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function StateChart({ stateSummaries }) {
  if (!stateSummaries || stateSummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facilities by State</CardTitle>
          <CardDescription>No state data available</CardDescription>
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
        <CardTitle>Facilities by State</CardTitle>
        <CardDescription>Top 15 states by number of facilities</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stateSummaries}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="state" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value} facilities`, "Count"]}
                contentStyle={{ backgroundColor: "white", borderRadius: "6px", border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
