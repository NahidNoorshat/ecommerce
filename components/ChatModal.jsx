"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { showLoginModal } from "@/lib/feature/auth/loginModalSlice";
import useChat from "@/hooks/useChat";

function ChatModal({
  productId,
  roomId,
  onClose,
  sendMessage: adminSendMessage,
  notifications = [],
}) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isAuthenticated = !!user;
  const isAdmin = user?.is_staff || user?.role === "admin";
  const username = user?.username;
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Customer-side hook
  const customerHook = !isAdmin
    ? useChat({ productId, customerId: user?.id })
    : null;

  const messages = isAdmin ? [] : customerHook?.messages || [];
  const connectionStatus = isAdmin
    ? "connected"
    : customerHook?.connectionStatus || "disconnected";
  const send = isAdmin ? adminSendMessage : customerHook?.sendMessage;

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ensure user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !username) {
      dispatch(showLoginModal({ reason: "chat" }));
      onClose();
    }
  }, [isAuthenticated, username, dispatch, onClose]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    setIsSending(true);
    try {
      const success = isAdmin
        ? await send({
            content: input,
            room_id: parseInt(roomId?.split("_")[1]),
          })
        : await send(input);
      if (success) setInput("");
      else toast.error("Failed to send message");
    } catch (err) {
      toast.error("Failed to send message");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  }, [input, send, isAdmin, roomId]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[450px] z-50 bg-white dark:bg-slate-800 border rounded-xl shadow-xl flex flex-col">
      <div className="p-3 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-xl">
        <h2 className="font-semibold text-sm">
          {isAdmin ? "💬 Admin Chat" : "💬 Chat with Seller"}
        </h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-sm"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex justify-between">
          <span>
            Status:{" "}
            <span
              className={`font-medium ${
                connectionStatus === "connected"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {connectionStatus}
            </span>
          </span>
        </div>

        {isAdmin && notifications?.length > 0 && (
          <div className="mb-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-xs">
            {notifications.map((note, i) => (
              <div key={i}>
                {note.event === "admin_joined"
                  ? `${note.admin_name} joined room ${note.room_id}`
                  : `${note.admin_name} sent: ${note.content}`}
              </div>
            ))}
          </div>
        )}

        {messages?.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={`${msg.id || i}_${msg.timestamp || Date.now()}`}
              className={`p-2 rounded-md max-w-[75%] ${
                msg.sender_name === username
                  ? "bg-blue-100 dark:bg-blue-900 ml-auto"
                  : "bg-gray-200 dark:bg-gray-700 mr-auto"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <strong className="text-xs font-medium">
                  {msg.sender_name === username ? "You" : msg.sender_name}
                </strong>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="mt-1">{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 border-t dark:border-gray-700">
        <div className="flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-l px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Type your message..."
            disabled={connectionStatus !== "connected" || isSending}
          />
          <button
            onClick={handleSend}
            disabled={
              connectionStatus !== "connected" || isSending || !input.trim()
            }
            className={`px-3 py-1 rounded-r text-sm ${
              connectionStatus === "connected" && !isSending
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed"
            }`}
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatModal;
