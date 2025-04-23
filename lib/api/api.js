import axios from "axios";
import { refreshToken, handleSessionExpiration } from "./auth";

const api = axios.create({
  baseURL: "http://13.51.157.149/api/",
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
