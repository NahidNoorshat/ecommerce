"use client";

// import useAdminChat from "@/hooks/useAdminChat";
import useAdminWebSocket from "@/hooks/useAdminWebSocket";

export default function AdminChatProvider({ children }) {
  useAdminWebSocket(); // ✅ Safely runs client-side logic
  return <>{children}</>;
}
