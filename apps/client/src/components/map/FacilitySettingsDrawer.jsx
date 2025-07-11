import { useState } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "../ui/sheet.jsx"
import { Button } from "../ui/button.jsx"

export function FacilitySettingsDrawer({
    open,
    onOpenChange,
    facility,
    settings = {},
    onSave,
}) {
    const [radius, setRadius] = useState(settings.radius ?? 50)
    const [unit, setUnit] = useState(settings.unit ?? "miles")
    const [color, setColor] = useState(settings.color ?? "#4f46e5")

    const handleSave = () => {
        const num = Number(radius)
        if (isNaN(num) || num < 1 || num > 1000) {
            alert("Please enter a radius between 1 and 1000")
            return
        }
        onSave?.({
            radius: num,
            unit,
            color,
        })
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="max-w-sm w-full">
                <SheetHeader>
                    <SheetTitle>Proximity Settings</SheetTitle>
                    <SheetDescription>
                        Configure proximity search for {" "}
                        <span className="font-medium">{facility?.name}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="radius-input">
                            Radius
                        </label>
                        <input
                            id="radius-input"
                            type="number"
                            min="1"
                            max="1000"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="unit-select">
                            Unit
                        </label>
                        <select
                            id="unit-select"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                        >
                            <option value="miles">Miles</option>
                            <option value="kilometers">Kilometers</option>
                        </select>
                    </div>

                    <div className="space-y-2 flex items-center gap-6">
                        <label className="text-sm font-medium" htmlFor="color-picker">
                            Set Color
                        </label>
                        <input
                            id="color-picker"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-12 h-8 p-0 border rounded"
                        />
                    </div>
                </div>

                <SheetFooter>
                    <Button className="w-full" onClick={handleSave}>
                        Save Settings
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
} 