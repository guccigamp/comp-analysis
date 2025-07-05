import { useState } from "react"

export function useAlert() {
    const [alertState, setAlertState] = useState({
        show: false,
        variant: "default",
        title: "",
        message: "",
    })

    const showAlert = ({ variant = "default", title, message, duration = 5000 }) => {
        setAlertState({ show: true, variant, title, message })

        if (duration > 0) {
            setTimeout(() => {
                setAlertState({ show: false, variant: "default", title: "", message: "" })
            }, duration)
        }
    }

    const hideAlert = () => {
        setAlertState({ show: false, variant: "default", title: "", message: "" })
    }

    return {
        alertState,
        showAlert,
        hideAlert,
    }
}
