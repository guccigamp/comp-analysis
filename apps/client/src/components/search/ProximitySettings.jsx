import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "../ui/button"
import { MapPin, Settings } from "lucide-react"
import { useSearch } from "../../contexts/SearchContext"

export function ProximitySettings() {
	const { filters, updateFilters, loading } = useSearch()
	const [isOpen, setIsOpen] = useState(false)
	const [proximityRadius, setProximityRadius] = useState("50")
	const [proximityUnit, setProximityUnit] = useState("miles")
	const menuRef = useRef(null)

	// Track if we're in the middle of an update
	const isUpdating = useRef(false)

	// Close menu when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setIsOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	// Sync local state with context when filters change
	useEffect(() => {
		if (isUpdating.current) return

		setProximityRadius(String(filters.proximity.radius))
		setProximityUnit(filters.proximity.unit)
	}, [filters.proximity.radius, filters.proximity.unit])

	// Handle proximity toggle
	const handleProximityToggle = () => {
		// If we're enabling proximity but don't have a center, show warning
		if (!filters.proximity.enabled && !filters.proximity.center) {
			alert("Please select a facility first to use as the center for proximity search.")
			return
		}

		isUpdating.current = true
		updateFilters({
			proximity: {
				...filters.proximity,
				enabled: !filters.proximity.enabled,
				radius: Number(proximityRadius),
				unit: proximityUnit,
			},
		})

		// Use RAF instead of setTimeout for better synchronization
		requestAnimationFrame(() => {
			isUpdating.current = false
		})
	}

	// Commit radius to context (after typing finished)
	const commitRadius = useCallback(
		() => {
			const num = Number(proximityRadius)
			if (isNaN(num) || num < 1 || num > 1000) return
			isUpdating.current = true
			updateFilters({
				proximity: {
					...filters.proximity,
					radius: num,
				},
			})
			requestAnimationFrame(() => {
				isUpdating.current = false
			})
		},
		[proximityRadius, filters.proximity, updateFilters],
	)

	const handleRadiusChange = useCallback((value) => {
		setProximityRadius(value)
	}, [])

	const handleRadiusKeyDown = useCallback((e) => {
		if (e.key === "Enter") {
			e.target.blur()
		}
	}, [])

	const handleUnitChange = useCallback(
		(value) => {
			setProximityUnit(value)

			// Update context immediately if proximity is enabled
			if (filters.proximity.enabled) {
				isUpdating.current = true
				updateFilters({
					proximity: {
						...filters.proximity,
						unit: value,
					},
				})
				requestAnimationFrame(() => {
					isUpdating.current = false
				})
			}
		},
		[filters.proximity, updateFilters],
	)

	return (
		<div className="relative" ref={menuRef}>
			<Button
				variant={filters.proximity.enabled ? "default" : "outline"}
				size="sm"
				className="gap-2"
				onClick={() => setIsOpen(!isOpen)}
				disabled={loading}
			>
				<MapPin className="h-4 w-4" />
				{filters.proximity.enabled ? `Proximity: ${filters.proximity.radius} ${filters.proximity.unit}` : "Proximity"}
			</Button>

			{isOpen && (
				<div className="absolute top-full mt-2 right-0 w-80 p-4 bg-background border rounded-lg shadow-lg z-50">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-medium">Proximity Search Settings</h4>
							<Settings className="h-4 w-4 text-muted-foreground" />
						</div>

						<p className="text-sm text-muted-foreground">
							Configure proximity search radius. When enabled, selecting a facility will show nearby facilities.
						</p>

						{/* Enable/Disable Toggle */}
						<div className="flex items-center justify-between p-3 border rounded-lg">
							<div>
								<div className="font-medium text-sm">Enable Proximity Search</div>
								<div className="text-xs text-muted-foreground">Show nearby facilities when selecting a location</div>
							</div>
							<button
								onClick={handleProximityToggle}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${filters.proximity.enabled ? "bg-primary" : "bg-gray-200"
									}`}
								disabled={loading}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.proximity.enabled ? "translate-x-6" : "translate-x-1"
										}`}
								/>
							</button>
						</div>

						{/* Radius and Unit Settings */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label htmlFor="radius" className="text-sm font-medium">
									Search Radius
								</label>
								<input
									id="radius"
									type="number"
									min="1"
									max="1000"
									value={proximityRadius}
									onChange={(e) => handleRadiusChange(e.target.value)}
									onBlur={commitRadius}
									onKeyDown={handleRadiusKeyDown}
									className="w-full p-2 border rounded-md text-sm"
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="unit" className="text-sm font-medium">
									Unit
								</label>
								<select
									id="unit"
									className="w-full p-2 border rounded-md text-sm"
									value={proximityUnit}
									onChange={(e) => handleUnitChange(e.target.value)}
									disabled={loading}
								>
									<option value="miles">Miles</option>
									<option value="kilometers">Kilometers</option>
								</select>
							</div>
						</div>

						{filters.proximity.enabled && filters.proximity.center && (
							<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
								<div className="text-sm text-blue-800">
									<strong>Proximity search is active</strong>
									<br />
									Center: {filters.proximity.center.latitude.toFixed(4)},{" "}
									{filters.proximity.center.longitude.toFixed(4)}
									<br />
									Radius: {proximityRadius} {proximityUnit}
								</div>
							</div>
						)}

						{!filters.proximity.center && (
							<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
								<div className="text-sm text-amber-800">
									<strong>No center selected</strong>
									<br />
									Select a facility on the map to set as the center for proximity search.
								</div>
							</div>
						)}

						<div className="flex justify-end pt-2 border-t">
							<Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
								Close
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
