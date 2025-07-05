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
        if (stored) {
            const parsedUser = JSON.parse(stored);
            // Ensure user object has all required fields, otherwise clear it
            if (parsedUser && parsedUser.id && parsedUser.role && parsedUser.name && parsedUser.email) {
                return parsedUser;
            } else {
                // Clear incomplete user data
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                return null;
            }
        }
        return null;
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
            setUser({ id: res.data._id, role: res.data.role, name: res.data.name, email: res.data.email, employeeId: res.data.employeeId });
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

    const value = useMemo(() => ({ user, token, isAuthenticated: !!token, login, logout, loading, isAdmin: user?.role === "admin" }), [user, token, login, logout, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 