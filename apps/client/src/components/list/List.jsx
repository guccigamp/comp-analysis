"use client"

import { useState, useMemo, useRef } from "react"
import { Table } from "./Table.jsx"
import { Button } from "../ui/button.jsx"
import { Download, Upload, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { useSearch } from "../../contexts/SearchContext.jsx"
import { exportFacilitiesToCSV } from "../../utils/export-utils.js"
import { useToast } from "../../hooks/use-toast.jsx"
import { uploadApi, templateApi } from "../../lib/api.js"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu.jsx"



export function List() {
    const [sortField, setSortField] = useState("companyName")
    const [sortDirection, setSortDirection] = useState("asc")
    const [isExporting, setIsExporting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const fileInputRef = useRef(null)

    // Use filtered facilities from search context
    const { filteredFacilities, loading, error, refreshData } = useSearch()

    const { toast } = useToast()

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

    // Handle refresh
    const handleRefresh = () => {
        refreshData()
    }

    // Handle file upload (CSV)
    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.name.toLowerCase().endsWith(".csv")) {
            toast({
                title: "Invalid file type",
                description: "Please select a CSV file.",
                variant: "destructive",
            })
            return
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please select a file smaller than 10MB.",
                variant: "destructive",
            })
            return
        }

        setIsUploading(true)
        try {
            const response = await uploadApi.uploadCSV(file)
            const result = response.data

            toast({
                title: "Upload successful",
                description: `Processed ${result.summary.processedRows} rows. ${result.summary.companiesProcessed} companies, ${result.summary.totalFacilities} facilities.`,
            })

            // Refresh facility data to show new additions
            refreshData()
        } catch (error) {
            console.error("Upload error:", error)
            const errorMessage = error.response?.data?.message || "Failed to upload CSV file"
            toast({
                title: "Upload failed",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsUploading(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    // Handle download of CSV templates
    const handleDownloadTemplate = async (type) => {
        try {
            const response =
                type === "address"
                    ? await templateApi.downloadAddressTemplate()
                    : await templateApi.downloadCoordinatesTemplate()

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `sample-${type}-template.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            toast({
                title: "Template downloaded",
                description: `${type} template has been downloaded successfully.`,
            })
        } catch (error) {
            console.error("Template download error:", error)
            toast({
                title: "Download failed",
                description: "Failed to download template. Please try again.",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-lg">Loading facilities...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Showing {sortedFacilities.length} facilities</div>
                <div className="flex gap-2">
                    {/* Refresh */}
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>

                    {/* Upload CSV */}
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {isUploading ? "Uploading..." : "Upload CSV"}
                        </Button>
                    </div>

                    {/* Export & Templates Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={sortedFacilities.length === 0 || loading}
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export & Templates
                                    </>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleExport}>Export Results</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadTemplate("address")}>Download Address Template</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadTemplate("coordinates")}>Download Coordinates Template</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Table
                facilities={sortedFacilities}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
            />
        </div>
    )
}
