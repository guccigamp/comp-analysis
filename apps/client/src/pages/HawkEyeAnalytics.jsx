import { FacilityAnalytics } from "../components/analytics/FacilityAnalytics.jsx"

export default function HawkEyeAnalytics() {
    return (
        <div className="flex flex-1 flex-col gap-4 mx-4 p-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">HawkEye Analytics</h1>
                <p className="text-muted-foreground">Comprehensive market analysis and competitive insights</p>
            </div>

            <div className="flex-1">
                <FacilityAnalytics />
            </div>
        </div>
    )
}
