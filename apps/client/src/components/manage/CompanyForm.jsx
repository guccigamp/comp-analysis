import { useState } from "react"
import { Button } from "../ui/button.jsx"
import { Input } from "../ui/input.jsx"
import { Label } from "../ui/label.jsx"
import { Loader2 } from "lucide-react"

export default function CompanyForm({ company, onSave, onCancel, isLoading }) {
    const [formData, setFormData] = useState({
        name: company?.name || "",
        legend_color: company?.legend_color || ""
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        const data = {
            ...formData,
        }
        onSave(data)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center gap-2">
                        <input
                            id="color"
                            type="color"
                            value={formData.legend_color || "#000000"}
                            onChange={(e) => setFormData({ ...formData, legend_color: e.target.value })}
                            className="w-12 h-10 rounded border border-input cursor-pointer"
                        />
                        <Input
                            value={formData.legend_color || "#000000"}
                            onChange={(e) => setFormData({ ...formData, legend_color: e.target.value })}
                            placeholder="#000000"
                            className="font-mono text-sm"
                        />
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {company ? "Update" : "Create"} Company
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}
