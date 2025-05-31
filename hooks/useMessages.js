import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import {
  wsConnectionChanged,
  messageReceived,
  chatUpdated,
  setAllChats,
  setMessageHistory,
} from "@/lib/feature/messages/messagesSlice";
import { toast } from "sonner";

const useMessages = (
  userId,
  productId,
  customerId,
  isAdmin = false,
  roomId = null
) => {
  const dispatch = useDispatch();
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const lastParams = useRef({ userId, productId, customerId });
  const [wsReady, setWsReady] = useState(false);

  const getValidToken = useCallback(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      console.error("No access token found in localStorage");
      return null;
    }
    return token;
  }, []);

  const connectWebSocket = useCallback(() => {
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      dispatch(wsConnectionChanged(false));
      toast.error("Max reconnection attempts reached");
      return;
    }

    if (!userId || !productId || !customerId) {
      dispatch(wsConnectionChanged(false));
      return;
    }

    const token = getValidToken();
    if (!token) {
      dispatch(wsConnectionChanged(false));
      toast.error("Authentication required");
      return;
    }

    const wsUrl = `${
      process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000"
    }/ws/chat/product_${productId}_user_${customerId}/?token=${encodeURIComponent(
      token
    )}`;

    wsRef.current = new WebSocket(wsUrl);

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);

    const connectionTimeout = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, "Connection timeout");
      }
    }, 10000);

    wsRef.current.onopen = () => {
      clearTimeout(connectionTimeout);
      dispatch(wsConnectionChanged(true));
      reconnectAttempts.current = 0;
      setWsReady(true); // ✅ set ready
      toast.success("Chat connected");

      if (isAdmin && roomId) {
        wsRef.current.send(
          JSON.stringify({ type: "join_chat", room_id: roomId })
        );
      }
    };

    // useMessages.js
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "connection_established":
            dispatch(wsConnectionChanged(true));
            break;
          case "chat.message":
            dispatch(messageReceived(data.message));
            if (data.message.unread_count !== undefined) {
              dispatch(
                chatUpdated({
                  id: data.message.room_id,
                  unread_count: data.message.unread_count,
                })
              );
            }
            break;
          case "chat_update":
            dispatch(chatUpdated(data.chat));
            break;
          case "active_chats":
            dispatch(setAllChats(data.chats));
            break;
          case "message_history":
            dispatch(
              setMessageHistory({
                roomId: data.room_id,
                messages: data.messages,
              })
            );
            break;
          case "chat_room_joined":
            dispatch(
              setMessageHistory({
                roomId: data.room.id,
                messages: data.messages,
              })
            );
            dispatch(wsConnectionChanged(true));
            break;
          case "error":
            console.error("WebSocket error message:", data.message);
            toast.error(`Chat error: ${data.message}`);
            break;
          default:
            console.warn("Unhandled WS message:", data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    wsRef.current.onclose = (event) => {
      setWsReady(false);
      clearTimeout(connectionTimeout);
      clearInterval(pingInterval);
      dispatch(wsConnectionChanged(false));

      if (
        event.code !== 1000 &&
        reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS
      ) {
        const delay = Math.min(5000, 1000 * reconnectAttempts.current);
        setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, delay);
      } else {
        toast.error("Chat disconnected");
      }
    };

    wsRef.current.onerror = (error) => {
      clearTimeout(connectionTimeout);
      dispatch(wsConnectionChanged(false));
      toast.error("Connection error");
    };
  }, [dispatch, getValidToken, userId, productId, customerId, isAdmin, roomId]);

  useEffect(() => {
    if (!userId || !productId || !customerId) {
      dispatch(wsConnectionChanged(false));
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      return;
    }

    if (
      lastParams.current.userId !== userId ||
      lastParams.current.productId !== productId ||
      lastParams.current.customerId !== customerId
    ) {
      lastParams.current = { userId, productId, customerId };
      connectWebSocket();
    }

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, "Cleanup");
      }
    };
  }, [userId, productId, customerId, connectWebSocket]);

  return {
    sendMessage: (message) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "chat_message",
            content: message.content,
            room_id: message.room_id,
          })
        );
        return true;
      } else {
        toast.error("Cannot send message: Not connected");
        return false;
      }
    },
    joinChatRoom: (roomId) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "join_chat", room_id: roomId })
        );
      } else {
        toast.error("Cannot join chat: Not connected");
      }
    },
  };
};

export default useMessages;
