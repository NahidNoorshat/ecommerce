"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import UserLoader from "./UserLoader";
import NotificationProvider from "@/components/NotificationProvider";
import LoginModal from "@/components/LoginModal";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Toaster } from "@/components/ui/sonner";
import { useSelector, useDispatch } from "react-redux";
import { setServerDown } from "@/lib/feature/server/serverSlice";
import Loader from "@/components/Loader";
import { API_BASE_URL } from "@/utils/config";

export default function ClientWrapper({ children }) {
  const dispatch = useDispatch();
  const isServerDown = useSelector((state) => state.server.isServerDown);
  const [isLoading, setIsLoading] = useState(true);
  const healthCheckRef = useRef(null);

  const checkServer = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${API_BASE_URL}/api/health-check/`, {
        signal: controller.signal,
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data?.status !== "ok") throw new Error("Invalid response");

      dispatch(setServerDown(false));
    } catch (err) {
      dispatch(setServerDown(true));
    } finally {
      if (isLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkServer();

    // Set up periodic checks with exponential backoff
    healthCheckRef.current = setInterval(
      () => {
        checkServer();
      },
      isServerDown ? 30000 : 60000
    ); // 30s if down, 60s if healthy

    return () => {
      if (healthCheckRef.current) {
        clearInterval(healthCheckRef.current);
      }
    };
  }, [dispatch, isServerDown]); // Add isServerDown to dependencies

  if (isLoading) {
    return <Loader />;
  }

  if (isServerDown) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
        <MaintenanceBanner />
        <div className="max-w-xl mt-12">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            🚧 Site Under Maintenance
          </h1>
          <p className="text-gray-700 text-lg">
            Our servers are currently unreachable. We're performing updates or
            may be temporarily offline.
          </p>
          <button
            onClick={() => {
              setIsLoading(true);
              checkServer();
            }}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <UserLoader />
      <Header />
      {children}
      <LoginModal />
      <Toaster />
    </NotificationProvider>
  );
}
