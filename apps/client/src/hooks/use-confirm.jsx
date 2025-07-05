import { useState } from "react"

export function useConfirm() {
    const [confirmState, setConfirmState] = useState({
        show: false,
        title: "",
        message: "",
        onConfirm: null,
        onCancel: null,
    })

    const showConfirm = ({ title, message, onConfirm, onCancel }) => {
        setConfirmState({
            show: true,
            title,
            message,
            onConfirm: () => {
                onConfirm?.()
                hideConfirm()
            },
            onCancel: () => {
                onCancel?.()
                hideConfirm()
            },
        })
    }

    const hideConfirm = () => {
        setConfirmState({
            show: false,
            title: "",
            message: "",
            onConfirm: null,
            onCancel: null,
        })
    }

    return {
        confirmState,
        showConfirm,
        hideConfirm,
    }
}
