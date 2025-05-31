import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "@/utils/config";

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/chats/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    chats: [],
    unreadCount: 0,
    loading: "idle",
    error: null,
    lastFetched: null,
    wsConnected: false,
  },
  reducers: {
    wsConnectionChanged(state, action) {
      state.wsConnected = action.payload;
    },
    messageReceived: (state, action) => {
      const message = action.payload;
      const roomId = message.room_id || action.meta?.roomId;

      if (!roomId) return;

      const index = state.chats.findIndex((c) => c.id === roomId);
      if (index !== -1) {
        const chat = state.chats[index];
        const existingMessages = chat.messages || [];
        const exists = existingMessages.some((m) => m.id === message.id);
        if (!exists) {
          state.chats[index] = {
            ...chat,
            messages: [...existingMessages, message],
            last_message: message,
            unread_count: 0,
          };
        }
      }
    },

    chatUpdated(state, action) {
      const updatedChat = action.payload;
      const index = state.chats.findIndex((c) => c.id === updatedChat.id);

      if (index !== -1) {
        const existing = state.chats[index];
        state.chats[index] = {
          ...existing,
          ...updatedChat,
          messages: updatedChat.messages || existing.messages, // ✅ preserve messages
        };
      } else {
        state.chats.push({ ...updatedChat, messages: [] });
      }

      state.unreadCount = state.chats.reduce(
        (sum, c) => sum + (c.unread_count || 0),
        0
      );
    },
    setAllChats(state, action) {
      state.chats = action.payload;
      state.unreadCount = state.chats.reduce(
        (sum, chat) => sum + chat.unread_count,
        0
      );
    },
    setMessageHistory(state, action) {
      const { roomId, messages } = action.payload;
      const chat = state.chats.find((c) => c.id === roomId);
      if (chat) {
        chat.messages = messages;
      }
    },
    updateChatMessages(state, action) {
      const { room, messages } = action.payload;
      const index = state.chats.findIndex((c) => c.id === room.id);

      if (index !== -1) {
        const existing = state.chats[index];

        state.chats[index] = {
          ...existing,
          ...room,
          product: room.product || existing.product,
          customer: room.customer || existing.customer,
          last_message: room.last_message || existing.last_message,
          messages: messages || existing.messages || [],
        };
      } else {
        state.chats.push({
          ...room,
          messages: messages || [],
        });
      }
    },

    // ✅ Correct location for this reducer
    unreadUpdate(state, action) {
      const { room_id, unread_count, last_message } = action.payload;
      const chat = state.chats.find((c) => c.id === room_id);
      if (chat) {
        chat.unread_count = unread_count;
        if (last_message) {
          chat.last_message = last_message;
        }
        state.unreadCount = state.chats.reduce(
          (sum, c) => sum + (c.unread_count || 0),
          0
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.chats = action.payload;
        state.unreadCount = state.chats.reduce(
          (sum, chat) => sum + chat.unread_count,
          0
        );
        state.lastFetched = Date.now();
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  wsConnectionChanged,
  messageReceived,
  chatUpdated,
  setAllChats,
  setMessageHistory,
  updateChatMessages, // ✅ new export
  unreadUpdate,
} = messagesSlice.actions;

export const selectAllChats = (state) => state.messages.chats;

export const selectMessageHistory = (state, roomId) => {
  const chat = state.messages.chats.find((c) => c.id === roomId);
  return chat?.messages || [];
};

export default messagesSlice.reducer;
