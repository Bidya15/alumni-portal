import axios from "axios";

const API_URL = "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle expired / invalid JWT (401 / 403)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
            // Token expired or invalid — clear session and redirect to home
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Reload the page so context resets and the user sees the login screen
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;
