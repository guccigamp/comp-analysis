import { Alert, AlertTitle, AlertDescription } from "./alert.jsx"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./alert-dialog.jsx"
import { X } from "lucide-react"
import { Button } from "./button.jsx"

export function AlertProvider({ alertState, confirmState, onAlertClose, onConfirmCancel }) {
    return (
        <>
            {/* Alert Component */}
            {alertState?.show && (
                <div className="fixed top-4 right-4 z-50 w-96">
                    <Alert variant={alertState.variant} className="relative">
                        {onAlertClose && (
                            <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-6 w-6 p-0" onClick={onAlertClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        {alertState.title && <AlertTitle>{alertState.title}</AlertTitle>}
                        {alertState.message && <AlertDescription>{alertState.message}</AlertDescription>}
                    </Alert>
                </div>
            )}

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmState?.show} onOpenChange={(open) => !open && onConfirmCancel?.()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmState?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{confirmState?.message}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={confirmState?.onCancel}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmState?.onConfirm}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
