// lib/api/secureAxios.js
import axios from "axios";
import { toast } from "sonner";
import { refreshToken, handleSessionExpiration } from "./auth";

const secureAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add Authorization token to every request
secureAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle 401 errors and refresh token
secureAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccess = await refreshToken();

      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return secureAxios(originalRequest);
      } else {
        await handleSessionExpiration();
      }
    }

    // ❌ Other errors
    toast.error(
      error.response?.data?.detail || error.message || "Something went wrong"
    );
    return Promise.reject(error);
  }
);

export default secureAxios;
