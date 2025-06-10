import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { authApi } from "../lib/api.js"

const AuthContext = createContext(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function AuthProvider({ children }) {
    // Load initial token & user from localStorage (if present)
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(false);

    // Keep localStorage in sync when token/user changes
    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const res = await authApi.login(email, password);
            const { token: jwt } = res.data;
            setToken(jwt);
            // Store minimal user info returned from API
            setUser({ id: res.data._id });
            return res.data;
        } catch (err) {
            // Propagate error to caller
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
    }, []);

    const value = useMemo(() => ({ user, token, isAuthenticated: !!token, login, logout, loading }), [user, token, login, logout, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 