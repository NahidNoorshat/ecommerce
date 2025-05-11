import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
  },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload;
    },
    markNotificationRead: (state, action) => {
      const id = action.payload;
      const target = state.items.find((n) => n.id === id);
      if (target) target.is_read = true;
    },
    addNotification: (state, action) => {
      const exists = state.items.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.items = [action.payload, ...state.items]; // force new array
      }
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const {
  setNotifications,
  markNotificationRead,
  addNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
