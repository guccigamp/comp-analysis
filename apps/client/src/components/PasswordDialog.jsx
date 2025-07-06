import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog.jsx"
import { Button } from "./ui/button.jsx"
import { Input } from "./ui/input.jsx"
import { Label } from "./ui/label.jsx"
import { authApi } from "../lib/api.js"
import { useAlert } from "../hooks/use-alert.jsx"
import { AlertProvider } from "./ui/alert-provider.jsx"

export function PasswordDialog({ isOpen, onClose, onPasswordChanged }) {
    const { alertState, showAlert, hideAlert } = useAlert()
    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: ""
    })
    const [passwordError, setPasswordError] = useState("")
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate password confirmation
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New password and confirm password do not match.")
            return
        }

        try {
            setIsChangingPassword(true)
            setPasswordError("")

            await authApi.changePassword({ password: passwordData.newPassword })

            showAlert({
                variant: "success",
                title: "Success",
                message: "Password changed successfully!"
            })

            handleClose()
            if (onPasswordChanged) {
                onPasswordChanged()
            }
        } catch (error) {
            setPasswordError(error.response?.data?.message || "Failed to change password. Please try again.")
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleClose = () => {
        setPasswordData({
            newPassword: "",
            confirmPassword: ""
        })
        setPasswordError("")
        onClose()
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                                Choose a new password for your account.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="newPassword" className="text-right">
                                    New Password
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => {
                                        setPasswordData({ ...passwordData, newPassword: e.target.value })
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
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => {
                                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                        setPasswordError("")
                                    }}
                                    className="col-span-3"
                                    placeholder="Confirm new password"
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
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isChangingPassword}>
                                {isChangingPassword ? "Changing..." : "Change Password"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alert Provider */}
            <AlertProvider
                alertState={alertState}
                onAlertClose={hideAlert}
            />
        </>
    )
} 