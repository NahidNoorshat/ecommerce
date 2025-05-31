// hooks/useAdminWebSocket.js
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  wsConnectionChanged,
  unreadUpdate,
  messageReceived,
  setAllChats,
} from "@/lib/feature/messages/messagesSlice";
import { toast } from "sonner";

export default function useAdminWebSocket() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user?.id);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access") : null;

  const socketRef = useRef(null);
  const [wsReady, setWsReady] = useState(false);

  useEffect(() => {
    if (!userId || !token) return;

    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws/admin/chat/?token=${token}`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Admin WebSocket connected");
      dispatch(wsConnectionChanged(true));
      setWsReady(true);
      window.adminSocket = socket;
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📥 Admin WS message:", data);

      switch (data.type) {
        case "chat_unread_update":
          dispatch(unreadUpdate(data.message));
          break;
        case "chat.message":
          dispatch(messageReceived(data.message));
          break;
        case "active_chats":
          dispatch(setAllChats(data.chats));
          break;
        default:
          console.warn("Unhandled admin WS type:", data.type);
      }
    };

    socket.onclose = () => {
      console.warn("❌ Admin WebSocket closed");
      dispatch(wsConnectionChanged(false));
      toast.error("Admin WebSocket disconnected");
      setWsReady(false);
      window.adminSocket = null;
    };

    socket.onerror = (e) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("🔄 Admin WS reconnect attempt failed.");
      } else {
        console.error("WebSocket error:", e);
        dispatch(wsConnectionChanged(false));
        toast.error("Admin WebSocket error");
        setWsReady(false);
      }
    };

    return () => {
      socket.close();
      window.adminSocket = null;
    };
  }, [userId, token, dispatch]);

  return {
    socket: socketRef.current,
    wsReady,
  };
}
