"use client";

import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SidebarDash from "@/components/dashbord/SiderbarDash";

export default function LayoutAdmin({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useSelector((state) => state.user);
  const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);

  // Add a local state to confirm user authentication before rendering
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log("User Data:", user);
  console.log("Loading State:", loading);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "admin") {
        // Redirect unauthorized users
        const roleRedirect = {
          seller: "/dashboard/seller",
          customer: "/dashboard/customer",
        };
        router.replace(roleRedirect[user.role] || "/");
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [user, loading, router, pathname]);

  // Show loading state until authentication is confirmed
  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 z-50 ">
        <SidebarDash role="admin" />
      </div>

      {/* Main Content */}
      <div
        className={`min-h-screen transition-all duration-300 w-full ${
          isSidebarOpen ? "ml-16 lg:ml-64" : "ml-16"
        }`}
      >
        {/* Page Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
