import { useState } from "react"
import { Card } from "../ui/card.jsx"
import { Building, MapPin, Navigation, X, Settings } from "lucide-react"
import { FacilitySettingsDrawer } from "./FacilitySettingsDrawer.jsx"

export function FacilityCard({
	facility,
	selectedFacilityId,
	onSelectFacility,
	isProximity,
	onDeselect,
	settings = {},
	onSaveSettings,
	showSettings = false,
}) {
	const [settingsOpen, setSettingsOpen] = useState(false)

	return (
		<>
			<Card
				className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${selectedFacilityId === facility.id ? "ring-2 ring-primary" : ""}
                `}
				onClick={() => onSelectFacility(facility)}
			>
				<div className="flex items-start gap-3">
					<div className="p-2 rounded-full mt-1" style={{ backgroundColor: `${facility.color}20` }}>
						<Building className="h-4 w-4" style={{ color: facility.color }} />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between mb-1">
							<h4 className="font-medium text-sm truncate">{facility.name}</h4>
							<div className="flex items-center gap-1">
								{onDeselect ? (
									<button
										className="p-1 rounded hover:bg-muted/50"
										onClick={(e) => {
											e.stopPropagation()
											onDeselect(facility)
										}}
									>
										<X className="h-5 w-5" />
									</button>
								) : (
									facility.distance !== undefined && isProximity && (
										<div className="flex items-center gap-1 text-xs font-medium" style={{ color: facility.color }}>
											<Navigation className="h-3 w-3" />
											<span>{facility.distance} mi</span>
										</div>
									)
								)}
								{showSettings && (
									<button
										className="p-1 rounded hover:bg-muted/50"
										onClick={(e) => {
											e.stopPropagation()
											setSettingsOpen(true)
										}}
									>
										<Settings className="h-5 w-5" />
									</button>
								)}
							</div>
						</div>
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

			{showSettings && (
				<FacilitySettingsDrawer
					open={settingsOpen}
					onOpenChange={setSettingsOpen}
					facility={facility}
					settings={settings}
					onSave={(newSettings) => {
						onSaveSettings?.(facility.id, newSettings)
					}}
				/>
			)}
		</>
	)
}
