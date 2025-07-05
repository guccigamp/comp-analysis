import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog.jsx"
import { Button } from "../../ui/button.jsx"
import { Input } from "../../ui/input.jsx"
import { Label } from "../../ui/label.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select.jsx"


const ROLES = {
    admin: "Admin",
    user: "User",
}

export function UserDialog({ isOpen, onClose, onSubmit, user = null, title, description }) {
    const [passwordError, setPasswordError] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        employeeId: "",
        role: "user",
        password: "",
        confirmPassword: "",
    })

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                employeeId: user.employeeId || "",
                role: user.role || "user",
                password: "", // Don't pre-fill password for security
                confirmPassword: "",
            })
        } else {
            setFormData({
                name: "",
                email: "",
                employeeId: "",
                role: "user",
                password: "",
                confirmPassword: "",
            })
        }
        setPasswordError("")
    }, [user, isOpen])

    const handleSubmit = (e) => {
        e.preventDefault()

        // Validate password confirmation for new users
        if (!user && formData.password !== formData.confirmPassword) {
            setPasswordError("Password and confirm password do not match.")
            return
        }

        // Clear any previous error
        setPasswordError("")
        onSubmit(formData)
    }

    const handleClose = () => {
        setFormData({
            name: "",
            email: "",
            employeeId: "",
            role: "user",
            password: "",
            confirmPassword: "",
        })
        setPasswordError("")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="employeeId" className="text-right">
                                Employee ID
                            </Label>
                            <Input
                                id="employeeId"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Role
                            </Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ROLES).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {!user && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="password" className="text-right">
                                        New Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormData({ ...formData, password: e.target.value })
                                            setPasswordError("")
                                        }}
                                        className="col-span-3"
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="confirmPassword" className="text-right">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            setFormData({ ...formData, confirmPassword: e.target.value })
                                            setPasswordError("")
                                        }}
                                        className="col-span-3"
                                        placeholder="Confirm password"
                                        required
                                    />
                                </div>
                                {passwordError && (
                                    <div className="items-center justify-center">
                                        <div className="text-sm text-red-600 text-center">
                                            {passwordError}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit">{user ? "Update User" : "Add User"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
