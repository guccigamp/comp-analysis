import { Card } from "../ui/card.jsx"
import { Building } from "lucide-react"

export function FacilityCard({ facility }) {
	return (
		<Card className="mt-4 p-4">
			<div className="flex items-start gap-3">
				<div className="p-2 rounded-full" style={{ backgroundColor: `${facility.color}20` }}>
					<Building className="h-5 w-5" style={{ color: facility.color }} />
				</div>
				<div>
					<h2 className="font-bold">{facility.name}</h2>
					<h3 className="font-bold">{facility.companyName}</h3>
					<p className="text-sm text-muted-foreground">{facility.address}</p>
					<div className="flex flex-wrap items-center gap-2 mt-1">
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
	)
}
