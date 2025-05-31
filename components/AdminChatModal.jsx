"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import useAdminChatRoom from "@/hooks/useAdminChatRoom";

export default function AdminChatModal({
  productId,
  customerId,
  roomId,
  onClose,
}) {
  const user = useSelector((state) => state.user.user);
  const username = user?.username;

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // ✅ Join room and listen to messages
  useAdminChatRoom(roomId);

  const chats = useSelector((state) => state.messages.chats);
  const chat = chats.find((c) => c.id === roomId);
  const messages = chat?.messages || [];

  const sendMessage = () => {
    const ws = window.adminSocket; // attached globally in useAdminWebSocket
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("WebSocket not connected or input is empty");
      return;
    }

    ws.send(
      JSON.stringify({
        type: "chat_message",
        content: input.trim(),
        room_id: roomId,
      })
    );

    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-lg">
        <div className="p-3 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-md">
          <h2 className="text-sm font-medium">💬 Admin Chat</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-10">
              No messages yet.
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded max-w-[75%] text-sm ${
                  msg.sender_name === username
                    ? "ml-auto bg-blue-100 dark:bg-blue-900"
                    : "mr-auto bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {msg.sender_name === username ? "You" : msg.sender_name}
                </div>
                <div>{msg.content}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-2 border-t">
          <div className="flex">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 border rounded-l px-2 py-1 text-sm focus:outline-none"
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="bg-blue-600 text-white px-3 py-1 rounded-r text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
