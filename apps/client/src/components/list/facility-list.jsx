import { useState, useMemo } from "react"
import { FacilityTable } from "./facility-table"
import { Button } from "../ui/button"
import { Download, Loader2 } from "lucide-react"
import { useSearch } from "../../contexts/search-context"
import { exportFacilitiesToCSV } from "../../utils/export-utils"
import { useToast } from "../../hooks/use-toast"

export function FacilityList() {
  const [sortField, setSortField] = useState("companyName")
  const [sortDirection, setSortDirection] = useState("asc")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  // Use filtered facilities from search context
  const { filteredFacilities } = useSearch()

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Sort filtered facilities
  const sortedFacilities = useMemo(() => {
    return [...filteredFacilities].sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredFacilities, sortField, sortDirection])

  // Handle export
  const handleExport = async () => {
    if (sortedFacilities.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no facilities matching your current filters.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      // Generate filename with date
      const date = new Date().toISOString().split("T")[0]
      const filename = `facilities-${date}.csv`

      // Export data
      exportFacilitiesToCSV(sortedFacilities, filename)

      toast({
        title: "Export successful",
        description: `${sortedFacilities.length} facilities exported to ${filename}`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">Showing {sortedFacilities.length} facilities</div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting || sortedFacilities.length === 0}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </>
          )}
        </Button>
      </div>

      <FacilityTable
        facilities={sortedFacilities}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  )
}
