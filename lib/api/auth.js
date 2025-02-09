import { clearUser } from "@/lib/feature/users/userSlice";
import { purgeStoredState } from "redux-persist";
import storage from "redux-persist/lib/storage";

// 🔄 Refresh Token
export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/newauth/token/refresh/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      }
    );

    if (response.ok) {
      const { access } = await response.json();
      localStorage.setItem("access", access);
      return access;
    } else {
      console.warn("Token refresh failed. Logging out...");
      handleSessionExpiration();
      return null;
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
};

// 🔒 Logout Function
export const logoutUser = async (dispatch) => {
  const refreshToken = localStorage.getItem("refresh");
  const accessToken = localStorage.getItem("access");

  if (!refreshToken) {
    await clearSessionData(dispatch);
    return;
  }

  try {
    await fetch("http://127.0.0.1:8000/api/newauth/logout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    await clearSessionData(dispatch);
    alert("Logged out successfully.");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// 🔔 Session Expiration Handler
export const handleSessionExpiration = async () => {
  console.warn("Session expired. Redirecting to login...");
  await clearSessionData();
  window.location.href = "/login";
};

// 🗑️ Clear Local Storage & Redux State
export const clearSessionData = async (dispatch) => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");

  await purgeStoredState({ key: "root", storage });

  if (dispatch) {
    dispatch(clearUser()); // Reset user state in Redux
  }
};
