import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "../ui/button"

export function MapErrorState({ error, onRetry }) {
    return (
        <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            )}
        </div>
    )
}