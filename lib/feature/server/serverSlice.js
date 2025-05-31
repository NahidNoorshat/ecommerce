// lib/feature/server/serverSlice

import { createSlice } from "@reduxjs/toolkit";

const serverSlice = createSlice({
  name: "server",
  initialState: {
    isServerDown: false,
  },
  reducers: {
    setServerDown: (state, action) => {
      state.isServerDown = action.payload;
    },
  },
});

export const { setServerDown } = serverSlice.actions;
export default serverSlice.reducer;
