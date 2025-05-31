// src/utils/config.js
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
export const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";
export const PRODUCTS_API = `${API_BASE_URL}/api/products`;
export const USERS_API = `${API_BASE_URL}/api/users`;
export const ORDERS_API = `${API_BASE_URL}/api/orders`;
export const SHIPPIN_API = `${API_BASE_URL}/api/shipping`;
export const USER_AUTH = `${API_BASE_URL}/api/newauth`;
export const ANALYTICS_API = `${API_BASE_URL}/api/analytics`;
export const BANNER_API = `${API_BASE_URL}/api/banners`;
export const CATEGORIES_API = `${PRODUCTS_API}/categories`;
export const REVIEWS_API = `${API_BASE_URL}/api/reviews`;
export const NOTIFICATIONS_API = `${API_BASE_URL}/api/notifications`;
export const CHAT_API = `${API_BASE_URL}/api/chat`;
