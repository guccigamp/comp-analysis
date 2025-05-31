import { allLocations } from "../data/all-locations"

// Flatten the facility data for easier display in a table
export const flattenFacilityData = () => {
  const flatData = []

  allLocations.forEach((company) => {
    company.facility.forEach((facility) => {
      flatData.push({
        id: facility.id,
        companyId: company.id,
        companyName: company.name,
        address: facility.address,
        state: facility.state,
        latitude: facility.latitude,
        longitude: facility.longitude,
        color: company.legend_color,
      })
    })
  })

  return flatData
}

// Extract city from address
export function extractCityFromAddress(address) {
  const parts = address.split(",").map((part) => part.trim())
  if (parts.length >= 2) {
    const cityPart = parts[parts.length - 2]
    return cityPart.replace(/\d+.*$/, "").trim()
  }
  return ""
}

// Get unique cities from facilities
export function getUniqueCities(facilities) {
  const citySet = new Set()
  facilities.forEach((facility) => {
    const city = extractCityFromAddress(facility.address)
    if (city) {
      citySet.add(city)
    }
  })
  return Array.from(citySet).sort()
}

// Get unique states from facilities
export const getUniqueStates = (facilities) => {
  const stateSet = new Set()
  facilities.forEach((facility) => stateSet.add(facility.state))
  return Array.from(stateSet).sort()
}

// Get unique companies from facilities
export const getUniqueCompanies = (facilities) => {
  const companyMap = new Map()

  facilities.forEach((facility) => {
    companyMap.set(facility.companyId, facility.companyName)
  })

  return Array.from(companyMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Search facilities with multiple criteria
export function searchFacilities(facilities, searchTerm) {
  if (!searchTerm.trim()) return facilities

  const searchLower = searchTerm.toLowerCase()

  return facilities.filter((facility) => {
    const city = extractCityFromAddress(facility.address)

    return (
      facility.companyName.toLowerCase().includes(searchLower) ||
      facility.address.toLowerCase().includes(searchLower) ||
      facility.state.toLowerCase().includes(searchLower) ||
      city.toLowerCase().includes(searchLower)
    )
  })
}

// Get company summaries
export const getCompanySummaries = () => {
  return allLocations
    .map((company) => ({
      id: company.id,
      name: company.name,
      color: company.legend_color,
      count: company.facility.length,
    }))
    .sort((a, b) => b.count - a.count)
}

// Get state summaries
export const getStateSummaries = () => {
  const stateCount = {}

  allLocations.forEach((company) => {
    company.facility.forEach((facility) => {
      if (stateCount[facility.state]) {
        stateCount[facility.state]++
      } else {
        stateCount[facility.state] = 1
      }
    })
  })

  return Object.entries(stateCount)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
}

// Get total facilities count
export const getTotalFacilitiesCount = () => {
  return allLocations.reduce((total, company) => total + company.facility.length, 0)
}

// Get top companies by facility count
export const getTopCompanies = (limit = 5) => {
  return getCompanySummaries().slice(0, limit)
}

// Get average facilities per company
export const getAverageFacilitiesPerCompany = () => {
  const totalFacilities = getTotalFacilitiesCount()
  return totalFacilities / allLocations.length
}
