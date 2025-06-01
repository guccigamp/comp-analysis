import { Routes, Route } from "react-router-dom"
import { SearchProvider } from "./contexts/search-context"
import { flattenFacilityData } from "./utils/facility-utils"
import Dashboard from "./pages/Dashboard"

function App() {
  const allFacilities = flattenFacilityData()

  return (
    <SearchProvider allFacilities={allFacilities}>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </SearchProvider>
  )
}

export default App
