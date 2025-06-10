import axios from "axios";

const API_URL = "https://comp-analysis-xlky.onrender.com/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to include JWT token if present
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const companyApi = {
    // Get all companies with their facilities
    getAllCompanies: () => api.get("/companies"),

    // Get a specific company by ID
    getCompanyById: (id) => api.get(`/companies/${id}`),

    // Create a new company
    createCompany: (data) => api.post("/companies", data),

    // Update a company
    updateCompany: (id, data) => api.put(`/companies/${id}`, data),

    // Delete a company (soft delete)
    deleteCompany: (id) => api.delete(`/companies/${id}`),
};

export const facilityApi = {
    // Get all facilities
    getAllFacilities: () => api.get("/facilities"),

    // Get facility by ID
    getFacilityById: (id) => api.get(`/facilities/${id}`),

    // Create a new facility
    createFacility: (data) => api.post("/facilities", data),

    // Update a facility
    updateFacility: (id, data) => api.put(`/facilities/${id}`, data),

    // Delete a facility
    deleteFacility: (id) => api.delete(`/facilities/${id}`),

    // Get facilities with advanced filtering
    getFilteredFacilities: (filters = {}) => {
        const params = new URLSearchParams();

        // Add all filter parameters
        if (filters.companies?.length) {
            params.append("companyId", filters.companies.join(","));
        }
        if (filters.states?.length) {
            params.append("state", filters.states.join(","));
        }
        if (filters.cities?.length) {
            params.append("city", filters.cities.join(","));
        }
        if (filters.searchTerm) {
            params.append("searchTerm", filters.searchTerm);
        }
        if (filters.latitude && filters.longitude) {
            params.append("latitude", filters.latitude);
            params.append("longitude", filters.longitude);
        }
        if (filters.radius) {
            params.append("radius", filters.radius);
        }
        if (filters.unit) {
            params.append("unit", filters.unit);
        }
        if (filters.limit) {
            params.append("limit", filters.limit);
        }
        if (filters.offset) {
            params.append("offset", filters.offset);
        }

        return api.get(`/facilities/filter?${params.toString()}`, {
            headers: { "Cache-Control": "no-cache" },
        });
    },

    // Get nearby facilities
    getFacilitiesNearby: (latitude, longitude, radius = 50, unit = "miles") => {
        const params = { latitude, longitude, radius, unit };
        return api.get("/facilities/nearby", { params });
    },

    // Get facilities by state
    getFacilitiesByState: (state) => api.get(`/facilities/state/${state}`),

    // Get facilities by company
    getFacilitiesByCompany: (companyId) =>
        api.get(`/facilities/company/${companyId}`),
};

export const uploadApi = {
    // Upload CSV file
    uploadCSV: (file) => {
        const formData = new FormData();
        formData.append("file", file);

        return api.post("/upload/csv", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

export const templateApi = {
    // Download address template
    downloadAddressTemplate: () =>
        api.get("/templates/address", {
            responseType: "blob",
        }),

    // Download coordinates template
    downloadCoordinatesTemplate: () =>
        api.get("/templates/coordinates", {
            responseType: "blob",
        }),
};

export const healthApi = {
    // Health check
    checkHealth: () => axios.get(`${API_URL.replace("/api", "")}/health`),
};

// ADD AUTH API
export const authApi = {
    login: (email, password) => api.post("/auth/login", { email, password }),
    register: (data) => api.post("/auth/register", data),
    updateProfile: (data) => api.put("/auth/profile", data),
};

export const markerApi = {
    getMarker: (color, logoURL = "") => {
        const params = new URLSearchParams();
        params.append("color", color);
        if (logoURL) params.append("logoURL", logoURL);
        return api.get(`/markers?${params.toString()}`, {
            responseType: "blob",
        });
    },
};

export default api;
