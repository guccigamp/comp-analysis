import { Card } from "../ui/card"
import { Building, MapPin, Loader2, AlertCircle } from "lucide-react"
import { Button } from "../ui/button"

export function FacilityCardList({ facilities, onSelectFacility, selectedFacilityId, loading, error, onRetry }) {
	if (loading) {
		return (
			<div className="border rounded-lg p-4 h-[500px] flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
					<p className="text-sm text-muted-foreground">Loading facilities...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="border rounded-lg p-4 h-[500px] flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
					<p className="text-sm text-red-600 mb-2">{error}</p>
					{onRetry && (
						<Button variant="outline" size="sm" onClick={onRetry}>
							Try Again
						</Button>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="border rounded-lg p-4 h-[500px] overflow-y-auto">
			<h3 className="font-medium mb-3">Facilities ({facilities.length})</h3>

			{facilities.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
					<p>No facilities match your search criteria</p>
				</div>
			) : (
				<div className="space-y-3">
					{facilities.map((facility) => (
						<Card
							key={facility.id}
							className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${selectedFacilityId === facility.id ? "ring-2 ring-primary" : ""
								}`}
							onClick={() => onSelectFacility(facility)}
						>
							<div className="flex items-start gap-3">
								<div className="p-2 rounded-full mt-1" style={{ backgroundColor: `${facility.color}20` }}>
									<Building className="h-4 w-4" style={{ color: facility.color }} />
								</div>
								<div className="flex-1 min-w-0">
									<h4 className="font-medium text-sm truncate">{facility.name}</h4>
									<p className="text-xs text-muted-foreground truncate">{facility.companyName}</p>
									<div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
										<MapPin className="h-3 w-3" />
										<span className="truncate">{facility.address}</span>
									</div>
									<div className="flex flex-wrap items-center gap-1 mt-1">
										<span
											className="text-xs px-2 py-0.5 rounded-full"
											style={{
												backgroundColor: `${facility.color}20`,
												color: facility.color,
											}}
										>
											{facility.state}
										</span>
										{facility.tags && facility.tags.length > 0 &&
											facility.tags.map((tag) => (
												<span
													key={tag}
													className="text-xs px-2 py-0.5 rounded-full"
													style={{
														backgroundColor: `${facility.color}20`,
														color: facility.color,
													}}
												>
													{tag}
												</span>
											))}
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	)
}
