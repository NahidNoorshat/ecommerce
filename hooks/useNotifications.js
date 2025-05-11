"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNotification,
  setNotifications,
} from "@/lib/feature/notifications/notificationSlice";
import { refreshNotifications } from "@/utils/notifications";

// Default WebSocket URL (configurable via environment variable or prop)
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";

export default function useNotifications({
  wsUrl = WS_URL,
  retryDelay = 5000,
} = {}) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const socketRef = useRef(null);
  const initializedRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

  // Fetch initial notifications
  const fetchInitialNotifications = async () => {
    try {
      await refreshNotifications(dispatch);
    } catch (err) {
      console.error("❌ Failed to fetch initial notifications:", err);
    }
  };

  // Setup WebSocket with retry logic
  const setupWebSocket = () => {
    if (!user?.id) {
      console.warn("🕐 User ID not available, skipping WebSocket setup");
      return;
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log("⚠️ WebSocket already connected");
      return;
    }

    const ws = new WebSocket(`${wsUrl}/ws/notifications/${user.id}/`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected for user:", user.id);
      clearTimeout(reconnectTimeoutRef.current); // Clear any reconnect attempts
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.message) {
          console.log("📨 Received WebSocket message:", data.message);
          dispatch(addNotification(data.message));
          // Optional: Sync with server
          fetchInitialNotifications();
        }
      } catch (err) {
        console.error("❌ WebSocket message parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    ws.onclose = () => {
      console.warn("🔌 WebSocket closed");
      socketRef.current = null;
      initializedRef.current = false;

      // Attempt to reconnect after delay
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("🔄 Attempting WebSocket reconnection...");
        setupWebSocket();
      }, retryDelay);
    };
  };

  useEffect(() => {
    if (!user?.id) {
      console.warn("🕐 Waiting for user ID before setting up notifications");
      return;
    }

    if (initializedRef.current) {
      console.log("⚠️ Notifications already initialized");
      return;
    }

    initializedRef.current = true;
    console.log("✅ Initializing notifications for user:", user.id);

    // Fetch initial notifications
    fetchInitialNotifications();

    // Add window focus listener to refresh notifications
    window.addEventListener("focus", fetchInitialNotifications);

    // Setup WebSocket with a delay to ensure backend readiness
    const socketTimeout = setTimeout(setupWebSocket, 200);

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up notifications hook");
      window.removeEventListener("focus", fetchInitialNotifications);
      clearTimeout(socketTimeout);
      clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current && socketRef.current.readyState < 2) {
        socketRef.current.close();
        console.log("🔁 WebSocket connection closed");
      }
      initializedRef.current = false; // Allow reinitialization if user changes
    };
  }, [user?.id, wsUrl, retryDelay, dispatch]);

  // Expose methods for manual control (optional)
  return {
    fetchNotifications: fetchInitialNotifications,
    reconnectWebSocket: setupWebSocket,
  };
}
