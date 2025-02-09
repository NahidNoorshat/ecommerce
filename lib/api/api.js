import axios from "axios";
import { refreshToken, handleSessionExpiration } from "./auth";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use(async (config) => {
  let access = localStorage.getItem("access");

  if (!access) {
    access = await refreshToken(); // Refresh token before making API requests
    if (!access) {
      handleSessionExpiration(); // Logout user if refresh fails
      return Promise.reject("Session expired. Redirecting to login.");
    }
  }

  config.headers.Authorization = `Bearer ${access}`;
  return config;
});

export default api;
