import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

export function CompanyPieChart({ companies, totalFacilities }) {
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
                data={companies}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="count"
              >
                {companies.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} facilities (${((value / totalFacilities) * 100).toFixed(1)}%)`,
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
