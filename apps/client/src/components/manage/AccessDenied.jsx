import { Shield } from "lucide-react"
import { Card, CardContent } from "../ui/card.jsx"

export default function AccessDenied() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to access this page</p>
            </div>

            <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-medium text-amber-800">Admin Access Required</h4>
                            <p className="text-sm text-amber-700">
                                You need administrator privileges to manage facility and company data. Contact your system administrator
                                for access.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
