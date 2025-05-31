import { clearUser } from "@/lib/feature/users/userSlice";
import { resetCart } from "@/lib/feature/card/cartSlice";
import { clearNotifications } from "@/lib/feature/notifications/notificationSlice"; // ✅ import this too

import { purgeStoredState } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { toast } from "sonner";
import { USER_AUTH } from "@/utils/config"; // 🔗 Import API base

// 🔄 Refresh Token
export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const response = await fetch(`${USER_AUTH}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

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
    await fetch(`${USER_AUTH}/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    await clearSessionData(dispatch);
    toast.success("You’ve been logged out.");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// 🔔 Final graceful session expiration handler
export const handleSessionExpiration = async (dispatch) => {
  console.warn("Session expired. Logging out...");
  toast.error("Your session expired. Please log in again.");
  await clearSessionData(dispatch);

  setTimeout(() => {
    window.location.href = "/login";
  }, 800); // Let toast appear before redirect
};

// 🗑️ Clear Local Storage & Redux State
export const clearSessionData = async (dispatch) => {
  // ✅ 1. Remove tokens
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");

  // ✅ 2. Remove persisted redux state manually (important!)
  localStorage.removeItem("persist:user");
  localStorage.removeItem("persist:cart");
  localStorage.removeItem("persist:notifications");

  // ❌ Remove this — you're not persisting root
  // await purgeStoredState({ key: "root", storage });

  // ✅ 3. Clear Redux state
  if (dispatch) {
    dispatch(clearUser());
    dispatch(resetCart());
    dispatch(clearNotifications());
  }
};
