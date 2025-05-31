import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const facilityApi = {
    getAllFacilities: () => api.get("/facilities"),
    getFacilityById: (id) => api.get(`/facilities/${id}`),
    getFacilitiesNearby: (lat, lng, radius) =>
        api.get(`/facilities/nearby`, { params: { lat, lng, radius } }),
    getFacilitiesByState: (state) => api.get(`/facilities/state/${state}`),
    getFacilitiesByCompany: (companyId) =>
        api.get(`/facilities/company/${companyId}`),
    getFilteredFacilities: (filters) =>
        api.get("/facilities/filter", { params: filters }),
};

export const companyApi = {
    getAllCompanies: () => api.get("/companies"),
    getCompanyById: (id) => api.get(`/companies/${id}`),
};

export default api;
