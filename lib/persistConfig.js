import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => ({
  getItem() {
    return Promise.resolve(null);
  },
  setItem() {
    return Promise.resolve();
  },
  removeItem() {
    return Promise.resolve();
  },
});

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local") // Use localStorage only on the client
    : createNoopStorage(); // Use noop storage on the server

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // Persist only the user slice
};

export default persistConfig;
