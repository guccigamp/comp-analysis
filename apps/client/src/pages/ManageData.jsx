"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx"
import { Button } from "../components/ui/button.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.jsx"
import { Plus, RefreshCw } from "lucide-react"
import { useToast } from "../hooks/use-toast.js"
import { uploadApi, templateApi, companyApi, facilityApi } from "../lib/api.js"
import { useSearch } from "../contexts/SearchContext.jsx"
import { useAuth } from "../contexts/AuthContext.jsx"
import { useAlert } from "../hooks/use-alert.jsx"
import { useConfirm } from "../hooks/use-confirm.jsx"
import { AlertProvider } from "../components/ui/alert-provider.jsx"

// Import manage components
import AccessDenied from "../components/manage/AccessDenied.jsx"
import CompanyForm from "../components/manage/CompanyForm.jsx"
import FacilityForm from "../components/manage/FacilityForm.jsx"
import CompanyTable from "../components/manage/CompanyTable.jsx"
import FacilityTable from "../components/manage/FacilityTable.jsx"
import UploadSection from "../components/manage/UploadSection.jsx"

export default function ManageData() {
    const { user } = useAuth()
    const { toast } = useToast()
    const { refreshData } = useSearch()
    const { alertState, showAlert, hideAlert } = useAlert()
    const { confirmState, showConfirm, hideConfirm } = useConfirm()

    // Check if user is admin
    const isAdmin = user?.role === "admin"

    // Upload states
    const [isUploading, setIsUploading] = useState(false)
    const [uploadResult, setUploadResult] = useState(null)

    // Data states
    const [companies, setCompanies] = useState([])
    const [facilities, setFacilities] = useState([])
    const [loading, setLoading] = useState(true)

    // Form states
    const [showCompanyForm, setShowCompanyForm] = useState(false)
    const [showFacilityForm, setShowFacilityForm] = useState(false)
    const [editingCompany, setEditingCompany] = useState(null)
    const [editingFacility, setEditingFacility] = useState(null)
    const [formLoading, setFormLoading] = useState(false)

    // Load data on component mount
    useEffect(() => {
        if (isAdmin) {
            loadData()
        }
    }, [isAdmin])

    const loadData = async () => {
        try {
            setLoading(true)
            const [companiesRes, facilitiesRes] = await Promise.all([
                companyApi.getAllCompanies(),
                facilityApi.getAllFacilities(),
            ])
            setCompanies(companiesRes.data)
            setFacilities(facilitiesRes.data)
        } catch (error) {
            console.error("Error loading data:", error)
            showAlert({
                variant: "destructive",
                title: "Error loading data",
                message: "Failed to load companies and facilities.",
            })
        } finally {
            setLoading(false)
        }
    }

    // Company CRUD operations
    const handleSaveCompany = async (data) => {
        try {
            setFormLoading(true)
            if (editingCompany) {
                await companyApi.updateCompany(editingCompany._id, data)
                toast({ title: "Company updated successfully" })
                showAlert({
                    variant: "success",
                    title: "Success",
                    message: "Company updated successfully",
                })
            } else {
                await companyApi.createCompany(data)
                toast({ title: "Company created successfully" })
                showAlert({
                    variant: "success",
                    title: "Success",
                    message: "Company created successfully",
                })
            }
            setShowCompanyForm(false)
            setEditingCompany(null)
            loadData()
        } catch (error) {
            console.error("Error saving company:", error)
            showAlert({
                variant: "destructive",
                title: "Error saving company",
                message: error.response?.data?.message || "Failed to save company.",
            })
        } finally {
            setFormLoading(false)
        }
    }

    const handleEditCompany = (company) => {
        setEditingCompany(company)
        setShowCompanyForm(true)
    }

    const handleDeleteCompany = async (company) => {
        showConfirm({
            title: "Delete Company",
            message: `Are you sure you want to delete "${company.name}"? This will also delete all associated facilities.`,
            onConfirm: async () => {
                try {
                    await companyApi.deleteCompany(company._id)
                    toast({ title: "Company deleted successfully" })
                    showAlert({
                        variant: "success",
                        title: "Success",
                        message: "Company deleted successfully",
                    })
                    loadData()
                    refreshData()
                } catch (error) {
                    console.error("Error deleting company:", error)
                    showAlert({
                        variant: "destructive",
                        title: "Error deleting company",
                        message: error.response?.data?.message || "Failed to delete company.",
                    })
                }
            },
        })
    }

    // Facility CRUD operations
    const handleSaveFacility = async (data) => {
        try {
            setFormLoading(true)
            const { _id, ...payload } = data

            // If an ID is provided in the submitted data or we have an editingFacility in state, treat as update
            if (_id || editingFacility) {
                const idToUpdate = _id || editingFacility._id
                await facilityApi.updateFacility(idToUpdate, payload)
                toast({ title: "Facility updated successfully" })
                showAlert({
                    variant: "success",
                    title: "Success",
                    message: "Facility updated successfully",
                })
            } else {
                await facilityApi.createFacility(payload)
                toast({ title: "Facility created successfully" })
                showAlert({
                    variant: "success",
                    title: "Success",
                    message: "Facility created successfully",
                })
            }
            setShowFacilityForm(false)
            setEditingFacility(null)
            loadData()
            refreshData()
        } catch (error) {
            console.error("Error saving facility:", error)
            showAlert({
                variant: "destructive",
                title: "Error saving facility",
                message: error.response?.data?.message || "Failed to save facility.",
            })
        } finally {
            setFormLoading(false)
        }
    }

    const handleEditFacility = (facility) => {
        setEditingFacility(facility)
        setShowFacilityForm(true)
    }

    const handleDeleteFacility = async (facility) => {
        showConfirm({
            title: "Delete Facility",
            message: `Are you sure you want to delete "${facility.name}"?`,
            onConfirm: async () => {
                try {
                    await facilityApi.deleteFacility(facility._id)
                    toast({ title: "Facility deleted successfully" })
                    showAlert({
                        variant: "success",
                        title: "Success",
                        message: "Facility deleted successfully",
                    })
                    loadData()
                    refreshData()
                } catch (error) {
                    console.error("Error deleting facility:", error)
                    showAlert({
                        variant: "destructive",
                        title: "Error deleting facility",
                        message: error.response?.data?.message || "Failed to delete facility.",
                    })
                }
            },
        })
    }

    // File upload functionality
    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        if (!file.name.toLowerCase().endsWith(".csv")) {
            showAlert({
                variant: "destructive",
                title: "Invalid file type",
                message: "Please select a CSV file.",
            })
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            showAlert({
                variant: "destructive",
                title: "File too large",
                message: "Please select a file smaller than 10MB.",
            })
            return
        }

        setIsUploading(true)
        setUploadResult(null)

        try {
            const response = await uploadApi.upload(file)
            const result = response.data

            setUploadResult({
                success: true,
                summary: result.summary,
                message: `Successfully processed ${result.summary.processedRows} rows. ${result.summary.companiesProcessed} companies, ${result.summary.totalFacilities} facilities.`,
            })

            showAlert({
                variant: "success",
                title: "Upload successful",
                message: `Processed ${result.summary.processedRows} rows.`,
            })

            loadData()
            refreshData()
        } catch (error) {
            console.error("Upload error:", error)
            const errorMessage = error.response?.data?.message || "Failed to upload CSV file"

            setUploadResult({
                success: false,
                message: errorMessage,
            })

            showAlert({
                variant: "destructive",
                title: "Upload failed",
                message: errorMessage,
            })
        } finally {
            setIsUploading(false)
            // Clear file input
            event.target.value = ""
        }
    }

    const handleDownloadTemplate = async (type) => {
        try {
            const response =
                type === "address"
                    ? await templateApi.downloadAddressTemplate()
                    : await templateApi.downloadCoordinatesTemplate()

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `sample-${type}-template.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            showAlert({
                variant: "success",
                title: "Template downloaded",
                message: `${type} template has been downloaded successfully.`,
            })
        } catch (error) {
            console.error("Template download error:", error)
            showAlert({
                variant: "destructive",
                title: "Download failed",
                message: "Failed to download template. Please try again.",
            })
        }
    }

    // Show access denied message for non-admin users
    if (!isAdmin) {
        return <AccessDenied />
    }

    return (
        <div className="flex flex-1 flex-col gap-4 mx-4 p-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Manage Data</h1>
                <p className="text-muted-foreground">Upload, manage, and organize your facility data</p>
            </div>

            <Tabs defaultValue="companies" className="flex-1">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="companies">Companies</TabsTrigger>
                    <TabsTrigger value="facilities">Facilities</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>

                {/* Companies Tab */}
                <TabsContent value="companies" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold">Companies</h2>
                            <p className="text-sm text-muted-foreground">Manage company information</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={loadData} disabled={loading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button onClick={() => setShowCompanyForm(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Company
                            </Button>
                        </div>
                    </div>

                    {showCompanyForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingCompany ? "Edit" : "Add"} Company</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CompanyForm
                                    company={editingCompany}
                                    onSave={handleSaveCompany}
                                    onCancel={() => {
                                        setShowCompanyForm(false)
                                        setEditingCompany(null)
                                    }}
                                    isLoading={formLoading}
                                />
                            </CardContent>
                        </Card>
                    )}

                    <CompanyTable
                        companies={companies}
                        loading={loading}
                        onEdit={handleEditCompany}
                        onDelete={handleDeleteCompany}
                    />
                </TabsContent>

                {/* Facilities Tab */}
                <TabsContent value="facilities" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold">Facilities</h2>
                            <p className="text-sm text-muted-foreground">Manage facility information</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={loadData} disabled={loading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button onClick={() => setShowFacilityForm(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Facility
                            </Button>
                        </div>
                    </div>

                    {showFacilityForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingFacility ? "Edit" : "Add"} Facility</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FacilityForm
                                    facility={editingFacility}
                                    companies={companies}
                                    onSave={handleSaveFacility}
                                    onCancel={() => {
                                        setShowFacilityForm(false)
                                        setEditingFacility(null)
                                    }}
                                    isLoading={formLoading}
                                />
                            </CardContent>
                        </Card>
                    )}

                    <FacilityTable
                        facilities={facilities}
                        loading={loading}
                        onEdit={handleEditFacility}
                        onDelete={handleDeleteFacility}
                        companies={companies}
                        onSave={handleSaveFacility}
                        formLoading={formLoading}
                    />
                </TabsContent>

                {/* Upload Tab */}
                <TabsContent value="upload" className="space-y-6">
                    <UploadSection
                        isUploading={isUploading}
                        uploadResult={uploadResult}
                        onFileUpload={handleFileUpload}
                        onDownloadTemplate={handleDownloadTemplate}
                    />
                </TabsContent>
            </Tabs>

            {/* Alert Provider for managing alerts and confirmations */}
            <AlertProvider
                alertState={alertState}
                confirmState={confirmState}
                onAlertClose={hideAlert}
                onConfirmCancel={hideConfirm}
            />
        </div>
    )
}
