import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/lib/feature/users/userSlice";
import sidebarReducer from "@/lib/feature/sidebar/sidebarSlice";
import cartReducer from "@/lib/feature/card/cartSlice";
import notificationReducer from "@/lib/feature/notifications/notificationSlice";
import loginModalReducer from "@/lib/feature/auth/loginModalSlice";
import messagesReducer from "@/lib/feature/messages/messagesSlice";
import serverReducer from "@/lib/feature/server/serverSlice";

import { persistReducer, persistStore } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const createNoopStorage = () => ({
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
});

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const userPersistConfig = {
  key: "user",
  storage,
};

const cartPersistConfig = {
  key: "cart",
  storage,
};

const store = configureStore({
  reducer: {
    user: persistReducer(userPersistConfig, userReducer),
    cart: persistReducer(cartPersistConfig, cartReducer),
    sidebar: sidebarReducer,
    notifications: notificationReducer,
    loginModal: loginModalReducer,
    messages: messagesReducer,
    server: serverReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
