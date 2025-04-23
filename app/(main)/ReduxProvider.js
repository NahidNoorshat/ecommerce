"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/lib/store";
import Loader from "@/components/Loader";
import { useEffect, useState } from "react";

export default function ReduxProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Optional: Clear old storage if you changed redux structure recently
  useEffect(() => {
    if (mounted && persistor) {
      persistor.purge(); // Remove this line after first refresh if everything ok
    }
  }, [mounted]);

  if (!mounted) {
    return <Loader />; // Don't render anything until mounted
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<Loader />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
