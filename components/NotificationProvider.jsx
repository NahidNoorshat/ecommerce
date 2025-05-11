"use client";

import useNotifications from "@/hooks/useNotifications";

export default function NotificationProvider({ children }) {
  useNotifications(); // ✅ Now runs safely on the client
  return <>{children}</>;
}
