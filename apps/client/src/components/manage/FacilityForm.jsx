import { useState } from "react"
import { Button } from "../ui/button.jsx"
import { Input } from "../ui/input.jsx"
import { Label } from "../ui/label.jsx"
import { Loader2 } from "lucide-react"

export default function FacilityForm({ facility, companies, onSave, onCancel, isLoading }) {
    const [formData, setFormData] = useState({
        name: facility?.name || "",
        companyId: facility?.companyId || "",
        address: facility?.address || "",
        city: facility?.city || "",
        state: facility?.state || "",
        zipCode: facility?.zipCode || "",
        latitude: facility?.latitude || "",
        longitude: facility?.longitude || "",
        tags: facility?.tags?.join(", ") || "",
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        const data = {
            ...formData,
            // Include facility ID if editing to allow parent to differentiate between create and update
            _id: facility?._id,
            latitude: formData.latitude ? Number.parseFloat(formData.latitude) : undefined,
            longitude: formData.longitude ? Number.parseFloat(formData.longitude) : undefined,
            tags: formData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        }
        onSave(data)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Facility Name *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="companyId">Company *</Label>
                    <select
                        id="companyId"
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        required
                    >
                        <option value="">Select a company</option>
                        {companies?.map((company) => (
                            <option key={company._id} value={company._id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., warehouse, distribution, retail"
                />
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {facility ? "Update" : "Create"} Facility
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}
