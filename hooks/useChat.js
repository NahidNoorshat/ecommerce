"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { WEBSOCKET_URL } from "@/utils/config";

export default function useChat({ productId, customerId = null }) {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [isAdmin, setIsAdmin] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const user = useSelector((state) => state.user.user);
  const isAuthenticated = !!user;

  // Generate room name
  const roomName = useCallback(() => {
    if (!user?.id || !productId) return null;
    return customerId
      ? `product_${productId}_user_${customerId}`
      : `product_${productId}_user_${user.id}`;
  }, [user, productId, customerId]);

  // WebSocket setup
  const setupWebSocket = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setConnectionStatus("error");
      setConnectionError("Max reconnection attempts reached");
      return;
    }

    const currentRoomName = roomName();
    if (!isAuthenticated || !currentRoomName) {
      setConnectionStatus("disconnected");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      setConnectionStatus("disconnected");
      setConnectionError("Missing auth token");
      return;
    }

    // Cleanup previous connection
    if (wsRef.current?.readyState !== WebSocket.CLOSED) {
      wsRef.current?.close(1000, "Reconnecting");
    }

    setConnectionStatus("connecting");
    const wsUrl = `${WEBSOCKET_URL}/ws/chat/${currentRoomName}/?token=${encodeURIComponent(
      token
    )}`;
    wsRef.current = new WebSocket(wsUrl);

    // Ping interval (keepalive)
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);

    // Connection timeout
    const connectionTimeout = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, "Connection timeout");
      }
    }, 10000);

    // Event handlers
    wsRef.current.onopen = () => {
      clearTimeout(connectionTimeout);
      setConnectionStatus("connected");
      reconnectAttempts.current = 0;
      toast.success("Chat connected", {
        id: "chat-connected",
        position: "top-right", // 👈 override position for this toast only
      });
    };

    wsRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        // Handle message types
        switch (data.type) {
          case "chat.message":
            if (data.message) {
              setMessages((prev) => [...prev, data.message]);
            } else {
              console.warn("Invalid chat.message format", data);
            }
            break;

          case "message_history":
            setMessages(
              data.messages.map((msg) => ({
                id: msg.id,
                content: msg.content,
                sender_id: msg.sender_id,
                sender_name: msg.sender_name,
                timestamp: msg.timestamp,
                is_read: msg.is_read,
                is_admin: msg.is_admin,
              }))
            );
            break;

          case "connection_established":
            setIsAdmin(data.is_admin || false);
            break;

          case "error":
            setConnectionError(data.message);
            toast.error(`Chat error: ${data.message}`);
            break;
        }
      } catch (error) {
        console.error("Message parse error:", error);
      }
    };

    wsRef.current.onerror = (e) => {
      clearTimeout(connectionTimeout);
      setConnectionStatus("error");
      setConnectionError("Connection error");
    };

    wsRef.current.onclose = (e) => {
      clearTimeout(connectionTimeout);
      clearInterval(pingInterval);
      setConnectionStatus("disconnected");

      if (e.code !== 1000) {
        setConnectionError(e.reason || "Disconnected");
        reconnectAttempts.current += 1;
        setTimeout(
          setupWebSocket,
          Math.min(5000, 1000 * reconnectAttempts.current)
        );
      }
    };

    return () => {
      clearTimeout(connectionTimeout);
      clearInterval(pingInterval);
    };
  }, [isAuthenticated, roomName]);

  // Initialize connection
  useEffect(() => {
    setupWebSocket();
    return () => {
      wsRef.current?.close(1000, "Component unmounted");
    };
  }, [setupWebSocket]);

  // Send message helper
  const sendMessage = useCallback((content) => {
    if (!content.trim()) {
      toast.error("Message is empty");
      return false;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Connection not ready");
      return false;
    }

    // Send message to backend
    wsRef.current.send(
      JSON.stringify({
        type: "chat_message", // matches backend expected type
        content: content.trim(),
      })
    );

    return true;
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    setupWebSocket();
  }, [setupWebSocket]);

  return {
    messages,
    sendMessage,
    connectionStatus,
    isAdmin,
    connectionError,
    showConnectionError,
    reconnect,
    wsInstance: wsRef.current,
  };
}
