import { Edit, Trash2, User, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader } from "../../ui/card.jsx"
import { Button } from "../../ui/button.jsx"
import { Badge } from "../../ui/badge.jsx"
import { Avatar, AvatarFallback } from "../../ui/avatar.jsx"

const ROLES = {
    admin: "Admin",
    user: "User",
}

const ROLE_COLORS = {
    admin: "bg-red-100 text-red-800",
    user: "bg-gray-100 text-gray-800",
}

export function UserCard({ user, onEdit, onDelete }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900">{user.name || "Unnamed User"}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                <User className="h-3 w-3 mr-1" />
                                {user.employeeId}
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(user._id)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <Badge className={ROLE_COLORS[user.role] || ROLE_COLORS.user}>{ROLES[user.role] || user.role}</Badge>
                    {user.createdAt && (
                        <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            Joined {formatDate(user.createdAt)}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
