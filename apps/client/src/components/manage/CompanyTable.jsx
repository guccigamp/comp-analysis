import { Button } from "../ui/button.jsx"
import { Card, CardContent } from "../ui/card.jsx"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.jsx"
import { Edit, Trash2, Loader2 } from "lucide-react"

export default function CompanyTable({ companies, loading, onEdit, onDelete }) {
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
                            <TableHead>Company Name</TableHead>
                            <TableHead>Facilities</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.map((company) => (
                            <TableRow key={company._id}>
                                <TableCell className="font-medium">{company.name}</TableCell>

                                <TableCell>{company.facilities?.length || 0}</TableCell>

                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => onEdit(company)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => onDelete(company)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
