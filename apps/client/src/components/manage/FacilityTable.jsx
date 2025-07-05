
import React from "react"
import { useState, useEffect } from "react"
import { Button } from "../ui/button.jsx"
import { Card, CardContent } from "../ui/card.jsx"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.jsx"
import { Badge } from "../ui/badge.jsx"
import { Edit, Trash2, Loader2, ChevronDown, ChevronRight, Plus } from "lucide-react"
import FacilityForm from "./FacilityForm.jsx"

export default function FacilityTable({ facilities, loading, onEdit, onDelete, companies, onSave, formLoading }) {
    const [expandedCompanies, setExpandedCompanies] = useState(new Set())
    const [editingFacility, setEditingFacility] = useState(null)
    const [animatingCompanies, setAnimatingCompanies] = useState(new Set())

    // Group facilities by company
    const facilitiesByCompany = facilities.reduce((acc, facility) => {
        const companyId = facility.companyId?._id || facility.companyId
        const companyName = facility.companyId?.name || "Unknown Company"

        if (!acc[companyId]) {
            acc[companyId] = {
                id: companyId,
                name: companyName,
                facilities: [],
            }
        }
        acc[companyId].facilities.push(facility)
        return acc
    }, {})

    const toggleCompanyExpansion = (companyId) => {
        const newExpanded = new Set(expandedCompanies)
        const newAnimating = new Set(animatingCompanies)

        if (newExpanded.has(companyId)) {
            // Collapsing - start animation then remove from expanded
            newAnimating.add(companyId)
            setAnimatingCompanies(newAnimating)

            setTimeout(() => {
                newExpanded.delete(companyId)
                setExpandedCompanies(newExpanded)

                // Remove from animating after expansion state is updated
                setTimeout(() => {
                    const finalAnimating = new Set(animatingCompanies)
                    finalAnimating.delete(companyId)
                    setAnimatingCompanies(finalAnimating)
                }, 50)
            }, 200)
        } else {
            // Expanding - add to expanded then animate
            newExpanded.add(companyId)
            newAnimating.add(companyId)
            setExpandedCompanies(newExpanded)
            setAnimatingCompanies(newAnimating)

            // Remove from animating after animation completes
            setTimeout(() => {
                const finalAnimating = new Set(animatingCompanies)
                finalAnimating.delete(companyId)
                setAnimatingCompanies(finalAnimating)
            }, 300)
        }
    }

    const handleEdit = (facility) => {
        setEditingFacility(facility)
    }

    const handleCancelEdit = () => {
        setEditingFacility(null)
    }

    const handleSave = async (data) => {
        try {
            await onSave(data)
            setEditingFacility(null)
        } catch (error) {
            // Error handling is done in parent component
            console.error("Error saving facility:", error)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-0">
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Company / Facility</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.values(facilitiesByCompany).map((company) => (
                            <React.Fragment key={company.id}>
                                {/* Company Header Row */}
                                <TableRow className="bg-muted/50 hover:bg-muted/70">
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleCompanyExpansion(company.id)}
                                            className="p-0 h-6 w-6"
                                            disabled={animatingCompanies.has(company.id)}
                                        >
                                            {expandedCompanies.has(company.id) ? (
                                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${animatingCompanies.has(company.id) ? 'animate-pulse' : ''
                                                    }`} />
                                            ) : (
                                                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${animatingCompanies.has(company.id) ? 'animate-pulse' : ''
                                                    }`} />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {company.name}
                                        <span className="ml-2 text-sm text-muted-foreground">({company.facilities.length} facilities)</span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground"></TableCell>
                                    <TableCell>

                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleCompanyExpansion(company.id)}
                                            disabled={animatingCompanies.has(company.id)}
                                        >
                                            {animatingCompanies.has(company.id) ? (
                                                <span className="flex items-center gap-1">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    {expandedCompanies.has(company.id) ? "Collapsing..." : "Expanding..."}
                                                </span>
                                            ) : (
                                                expandedCompanies.has(company.id) ? "Collapse" : "Expand"
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>

                                {/* Facility Rows (when expanded or animating) */}
                                {(expandedCompanies.has(company.id) || animatingCompanies.has(company.id)) &&
                                    company.facilities.map((facility, index) => {
                                        const isExpanded = expandedCompanies.has(company.id)
                                        const isAnimating = animatingCompanies.has(company.id)

                                        // Create animation classes
                                        const animationClasses = isAnimating
                                            ? isExpanded
                                                ? 'animate-in slide-in-from-top-2 fade-in duration-300'
                                                : 'animate-out slide-out-to-top-2 fade-out duration-200'
                                            : ''

                                        return (
                                            <React.Fragment key={facility._id}>
                                                <TableRow
                                                    className={`border-l-4 border-l-primary/20 ${animationClasses}`}
                                                    style={{
                                                        animationDelay: `${index * 50}ms`,
                                                        animationFillMode: 'both'
                                                    }}
                                                >
                                                    <TableCell></TableCell>
                                                    <TableCell className="pl-8">
                                                        <div className="font-medium">{facility.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {facility.city}, {facility.state} {facility.zipCode}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{facility.address || "No address"}</div>
                                                        {facility.latitude && facility.longitude && (
                                                            <div className="text-xs text-muted-foreground font-mono">
                                                                {facility.latitude.toFixed(4)}, {facility.longitude.toFixed(4)}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {facility.tags?.slice(0, 2).map((tag) => (
                                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                            {facility.tags?.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{facility.tags.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleEdit(facility)}
                                                                disabled={editingFacility?._id === facility._id}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => onDelete(facility)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>

                                                {/* Inline Edit Form Row */}
                                                {editingFacility?._id === facility._id && (
                                                    <TableRow className="bg-muted/30">
                                                        <TableCell colSpan={5} className="p-6">
                                                            <div className="border rounded-lg p-4 bg-background">
                                                                <h4 className="font-medium mb-4">Edit Facility: {facility.name}</h4>
                                                                <FacilityForm
                                                                    facility={editingFacility}
                                                                    companies={companies}
                                                                    onSave={handleSave}
                                                                    onCancel={handleCancelEdit}
                                                                    isLoading={formLoading}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        )
                                    })}
                            </React.Fragment>
                        ))}

                        {Object.keys(facilitiesByCompany).length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="text-muted-foreground">
                                        <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No facilities found</p>
                                        <p className="text-sm">Add your first facility to get started</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
