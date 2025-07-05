import { useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { Button } from "../ui/button.jsx"
import { Upload, Download, FileText, Database, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function UploadSection({ isUploading, uploadResult, onFileUpload, onDownloadTemplate }) {
    const fileInputRef = useRef(null)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload CSV Data
                    </CardTitle>
                    <CardDescription>
                        Upload facility data in CSV format. Supported formats include address-based and coordinate-based data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Upload Your Data</h3>
                        <p className="text-sm text-muted-foreground mb-4">Select a CSV file containing your facility data</p>

                        <input ref={fileInputRef} type="file" accept=".csv" onChange={onFileUpload} className="hidden" />

                        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} size="lg">
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose CSV File
                                </>
                            )}
                        </Button>
                    </div>

                    {uploadResult && (
                        <Card className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    {uploadResult.success ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <h4 className={`font-medium ${uploadResult.success ? "text-green-800" : "text-red-800"}`}>
                                            {uploadResult.success ? "Upload Successful" : "Upload Failed"}
                                        </h4>
                                        <p className={`text-sm ${uploadResult.success ? "text-green-700" : "text-red-700"}`}>
                                            {uploadResult.message}
                                        </p>
                                        {uploadResult.success && uploadResult.summary && (
                                            <div className="mt-2 text-sm text-green-700">
                                                <p>• Processed Rows: {uploadResult.summary.processedRows}</p>
                                                <p>• Companies: {uploadResult.summary.companiesProcessed}</p>
                                                <p>• Total Facilities: {uploadResult.summary.totalFacilities}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            {/* Templates Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Address Template
                        </CardTitle>
                        <CardDescription>Template for uploading facilities with address information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => onDownloadTemplate("address")} className="w-full" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download Address Template
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Coordinates Template
                        </CardTitle>
                        <CardDescription>Template for uploading facilities with precise coordinates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => onDownloadTemplate("coordinates")} className="w-full" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download Coordinates Template
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
