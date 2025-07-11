import { Building, Loader2, AlertCircle } from "lucide-react"
import { Button } from "../ui/button.jsx"
import { FacilityCard } from "./FacilityCard.jsx"

export function FacilityCardList({ facilities, onSelectFacility, selectedFacilityId, loading, error, onRetry, isProximity, showAlert }) {
	if (loading) {
		return (
			<div className="border rounded-lg p-4 h-[200px] flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
					<p className="text-sm text-muted-foreground">Loading facilities...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="border rounded-lg p-4 h-[200px] flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
					<p className="text-sm text-red-600 mb-2">{error}</p>
					{onRetry && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								onRetry()
								showAlert?.({
									variant: "default",
									title: "Retrying",
									message: "Attempting to reload facility data...",
									duration: 2000,
								})
							}}
						>
							Try Again
						</Button>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="border rounded-lg p-4 h-[200px] overflow-y-auto">
			<h3 className="font-medium mb-3">Facilities ({facilities.length})</h3>

			{facilities.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
					<p>No facilities match your search criteria</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{facilities.map((facility) => (
						<FacilityCard
							key={facility.id}
							facility={facility}
							selectedFacilityId={selectedFacilityId}
							onSelectFacility={onSelectFacility}
							isProximity={isProximity}
						/>
					))}
				</div>
			)}
		</div>
	)
}
