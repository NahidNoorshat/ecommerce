import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  messageReceived,
  unreadUpdate,
  wsConnectionChanged,
  setAllChats, // ✅ make sure it's imported
} from "@/lib/feature/messages/messagesSlice";

export default function useAdminChat() {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user?.id);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access") : null;

  useEffect(() => {
    if (!userId || !token) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/admin/chat/?token=${token}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      dispatch(wsConnectionChanged(true));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📥 WS:", data);

      if (data.type === "active_chats") {
        dispatch(setAllChats(data.chats)); // ✅ inject chats into redux
      }

      if (data.type === "chat_unread_update") {
        dispatch(unreadUpdate(data.message));
      }

      if (data.type === "chat.message") {
        dispatch(messageReceived(data.message));
      }
    };

    socket.onclose = () => {
      console.warn("❌ WebSocket closed");
      dispatch(wsConnectionChanged(false));
    };

    return () => {
      socket.close();
    };
  }, [userId, token, dispatch]);
}
