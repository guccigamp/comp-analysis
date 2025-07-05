import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext.jsx"
import { SearchProvider } from "./contexts/SearchContext.jsx"
import RequireAuth from "./components/RequireAuth.jsx"
import Login from "./pages/Login.jsx"
import Dashboard from "./pages/Dashboard.jsx"

function App() {
	return (
		<AuthProvider>
			<SearchProvider>
				<div className="min-h-screen bg-background">
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route
							path="/*"
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
