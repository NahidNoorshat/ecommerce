// utils/notifications.js
import { setNotifications } from "@/lib/feature/notifications/notificationSlice";
import secureAxios from "@/lib/api/secureAxios";
import { NOTIFICATIONS_API } from "@/utils/config";

export const refreshNotifications = async (dispatch) => {
  try {
    const res = await secureAxios.get(`${NOTIFICATIONS_API}/notifications`);
    const data = res.data;
    dispatch(setNotifications(Array.isArray(data) ? data : data.results || []));
  } catch (err) {
    console.error("Failed to refresh notifications", err);
  }
};
