import { useState } from "react";

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const toast = (toast) => {
        setToasts((prev) => [...prev, toast]);

        // Auto-remove toast after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.slice(1));
        }, 3000);
    };

    return { toast, toasts };
}
