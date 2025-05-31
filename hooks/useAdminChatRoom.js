import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  messageReceived,
  setMessageHistory,
  chatUpdated,
} from "@/lib/feature/messages/messagesSlice";
import useAdminWebSocket from "./useAdminWebSocket";

export default function useAdminChatRoom(roomId) {
  const dispatch = useDispatch();
  const { socket, wsReady } = useAdminWebSocket();

  useEffect(() => {
    if (wsReady && roomId && socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "join_chat", room_id: roomId }));
    }
  }, [roomId, wsReady, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 Admin WS Received:", data); // ✅ Debug log

        switch (data.type) {
          case "chat_room_joined":
            dispatch(
              setMessageHistory({
                roomId: data.room.id,
                messages: data.messages,
              })
            );
            break;

          case "chat.message":
            dispatch(
              messageReceived({
                ...data.message,
                room_id: roomId, // ✅ Inject the room_id manually
              })
            );
            dispatch(
              chatUpdated({
                id: roomId,
                unread_count: 0,
                last_message: data.message,
              })
            );
            break;

          default:
            break;
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, dispatch]);
}
