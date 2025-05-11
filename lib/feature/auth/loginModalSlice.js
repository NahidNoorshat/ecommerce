// lib/feature/auth/loginModalSlice.js

import { createSlice } from "@reduxjs/toolkit";

const loginModalSlice = createSlice({
  name: "loginModal",
  initialState: { open: false },
  reducers: {
    showLoginModal: (state) => {
      state.open = true;
    },
    hideLoginModal: (state) => {
      state.open = false;
    },
  },
});

export const { showLoginModal, hideLoginModal } = loginModalSlice.actions;
export default loginModalSlice.reducer;
