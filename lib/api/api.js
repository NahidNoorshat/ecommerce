import axios from "axios";
import { refreshToken, handleSessionExpiration } from "./auth";
import { API_BASE_URL } from "@/utils/config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  let access = localStorage.getItem("access");

  if (!access) {
    access = await refreshToken(); // Refresh if token missing
    if (!access) {
      handleSessionExpiration();
      return Promise.reject("Session expired. Redirecting to login.");
    }
  }

  config.headers.Authorization = `Bearer ${access}`;
  return config;
});

export default api;
