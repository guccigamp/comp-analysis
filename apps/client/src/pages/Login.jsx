import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx"
import { Label } from "../components/ui/label.jsx"
import { Input } from "../components/ui/input.jsx"
import { Button } from "../components/ui/button.jsx"
import { Mail } from "lucide-react"
import { useAuth } from "../contexts/AuthContext.jsx"


export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const { login, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setError(null)
            await login(email, password)
            // Redirect user to previous page or default dashboard
            const redirectTo = location.state?.from?.pathname || "/"
            navigate(redirectTo, { replace: true })
        } catch (err) {
            const message = err.response?.data?.message || "Unable to sign in. Please try again."
            setError(message)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="pt-4 border-t">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-3">Need help accessing your account?</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => (
                                    window.location.href = "mailto:admin@company.com?subject=Account Access Request"
                                )}
                            >
                                <Mail className="h-4 w-4" />
                                Contact Admin
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}