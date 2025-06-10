import { Loader2 } from "lucide-react"

export function MapLoadingState({ message = "Loading facilities..." }) {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">{message}</span>
        </div>
    )
}
