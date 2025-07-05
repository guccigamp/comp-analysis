import { Search } from "lucide-react"
import { Input } from "../../ui/input.jsx"

export function UserSearch({ searchTerm, onSearchChange }) {
    return (
        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
                placeholder="Search users"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 max-w-md"
            />
        </div>
    )
}
