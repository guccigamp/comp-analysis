import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { SearchProvider } from "./contexts/SearchContext"
import RequireAuth from "./components/RequireAuth"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

function App() {
	return (
		<AuthProvider>
			<SearchProvider>
				<div className="min-h-screen bg-background">
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route
							path="/"
							element={
								<RequireAuth>
									<Dashboard />
								</RequireAuth>
							}
						/>
					</Routes>
				</div>
			</SearchProvider>
		</AuthProvider>
	)
}

export default App
