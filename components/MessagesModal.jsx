"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ChatModal from "./ChatModal";
import {
  fetchMessages,
  selectAllChats,
  wsConnectionChanged,
} from "@/lib/feature/messages/messagesSlice";
import useMessages from "@/hooks/useMessages";

export default function MessagesModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { loading, error, lastFetched, wsConnected } = useSelector(
    (state) => state.messages
  );
  const chats = useSelector(selectAllChats);
  const [selectedChat, setSelectedChat] = useState(null);
  const userId = useSelector((state) => state.user.user?.id);
  const isAdmin = useSelector(
    (state) => state.user.user?.is_staff || state.user.user?.role === "admin"
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const { sendMessage, joinChatRoom, notifications } = useMessages(
    userId,
    selectedChat?.product?.id,
    selectedChat?.customer?.id,
    isAdmin // Enable admin mode
  );

  useEffect(() => {
    if (isOpen && (!lastFetched || Date.now() - lastFetched > 60000)) {
      dispatch(fetchMessages())
        .unwrap()
        .catch((err) => toast.error("Failed to load chats"));
    }
  }, [isOpen, lastFetched, dispatch]);

  useEffect(() => {
    if (selectedChat && wsConnected) {
      joinChatRoom(selectedChat.id);
    }
    setIsConnecting(selectedChat && !wsConnected);
  }, [selectedChat, wsConnected, joinChatRoom]);

  useEffect(() => {
    if (!isOpen) {
      dispatch(wsConnectionChanged(false));
      setSelectedChat(null);
      setIsConnecting(false);
    }
  }, [isOpen, dispatch]);

  const handleRetry = () => {
    dispatch(fetchMessages())
      .unwrap()
      .catch((err) => toast.error("Failed to reload chats"));
  };

  if (!isOpen) return null;
  if (!userId) return <div>Loading user data...</div>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {selectedChat ? "Chat" : "Messages"}
            </h2>
            {selectedChat && isConnecting && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Connecting...
              </span>
            )}
          </div>
          <button
            onClick={selectedChat ? () => setSelectedChat(null) : onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {selectedChat ? (
          <ChatModal
            productId={selectedChat.product.id}
            roomId={`product_${selectedChat.product.id}_user_${selectedChat.customer.id}`}
            onClose={() => setSelectedChat(null)}
            sendMessage={(content) =>
              sendMessage({ content, room_id: selectedChat.id })
            }
            notifications={notifications}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Existing chat list rendering */}
          </div>
        )}
      </div>
    </div>
  );
}

const ChatListItem = ({ chat, onClick }) => (
  <div
    onClick={onClick}
    className="p-4 hover:bg-accent cursor-pointer transition-colors flex gap-4"
  >
    <img
      src={chat.product?.thumbnail || "/placeholder.png"}
      alt={chat.product?.name}
      className="w-12 h-12 object-cover rounded-md"
    />
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{chat.product?.name}</h3>
          <p className="text-sm text-muted-foreground">
            {chat.customer?.username} — ${chat.product?.final_price}
          </p>
          <p className="text-sm line-clamp-1 text-gray-500">
            {chat.last_message?.content}
          </p>
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(chat.last_message?.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {chat.unread_count > 0 && (
        <div className="mt-2 flex justify-end">
          <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {chat.unread_count}
          </span>
        </div>
      )}
    </div>
  </div>
);

const Spinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
);
