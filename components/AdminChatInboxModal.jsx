"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import AdminChatModal from "@/components/AdminChatModal";
import structuredClone from "@ungap/structured-clone";
import { selectAllChats } from "@/lib/feature/messages/messagesSlice";

export default function AdminChatInboxModal({ isOpen, onClose }) {
  const [selectedChat, setSelectedChat] = useState(null);

  const chats = useSelector(selectAllChats);
  console.log(chats, "looking for response......");
  const userId = useSelector((state) => state.user.user?.id);
  const isAdmin = useSelector(
    (state) => state.user.user?.is_staff || state.user.user?.role === "admin"
  );

  const handleOpenChat = (chatId) => {
    const found = chats.find((c) => c.id === chatId);
    if (!found) {
      toast.error("Chat not found");
      return;
    }

    if (!found.product || !found.customer) {
      toast.error("Incomplete chat data. Try refreshing.");
      return;
    }

    const cloned = {
      ...found,
      product: { ...found.product },
      customer: { ...found.customer },
      last_message: found.last_message ? { ...found.last_message } : null,
    };

    setSelectedChat(cloned);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {selectedChat ? "Chat Room" : "Active Chats"}
          </h2>
          <button
            onClick={selectedChat ? () => setSelectedChat(null) : onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {selectedChat && selectedChat.product && selectedChat.customer ? (
          <AdminChatModal
            roomId={selectedChat.id}
            productId={selectedChat.product.id}
            customerId={selectedChat.customer.id}
            onClose={() => setSelectedChat(null)}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground">
                No active chats
              </p>
            ) : (
              chats.map((chat) => (
                <ChatListItem
                  key={
                    chat.id ||
                    chat.room_id ||
                    `${chat.customer?.id}-${chat.product?.id}`
                  }
                  chat={chat}
                  onClick={() => handleOpenChat(chat.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const ChatListItem = ({ chat, onClick }) => (
  <div
    onClick={onClick}
    className="p-4 hover:bg-accent cursor-pointer transition-colors flex gap-4 border-b"
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
