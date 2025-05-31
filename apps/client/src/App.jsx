import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { SearchProvider } from "./contexts/search-context"
import Dashboard from "./pages/Dashboard"
import Navbar from "./components/Navbar"

function App() {
  return (
    <Router>
      <SearchProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </SearchProvider>
    </Router>
  )
}

export default App
