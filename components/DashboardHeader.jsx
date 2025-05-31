"use client";

import { useEffect, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutUser } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./Toggole";
import MessagesModal from "@/components/MessagesModal";
import { selectAllChats } from "@/lib/feature/messages/messagesSlice";
import Loader from "./Loader";
import AdminChatInboxModal from "./AdminChatInboxModal";

export default function DashboardHeader() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isSidebarOpen } = useSelector((state) => state.sidebar);
  const { user, loading } = useSelector((state) => state.user);
  const notifications = useSelector((state) => state.notifications.items);
  // DashboardHeader.jsx
  // const unreadCount = useSelector((state) => state.messages.unreadCount);
  const unreadNotificationCount = notifications.filter(
    (n) => !n.is_read
  ).length;
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  console.log("DashboardHeader: user:", user); // Debug user
  const chats = useSelector(selectAllChats);
  const unreadCount = useSelector((state) => state.messages.unreadCount);
  console.log("🔁 unreadCount in header", unreadCount);

  useEffect(() => {
    const access =
      typeof window !== "undefined" && localStorage.getItem("access");
    if (!user && !access) {
      router.replace("/login");
    }
  }, [user, router]);

  if (loading) return <Loader />;

  const defaultUser = {
    fullName: "Guest",
    role: "unknown",
    profileImage: "/default-avatar.jpg",
  };

  const currentUser = {
    fullName: user?.username || defaultUser.fullName,
    role: user?.role || defaultUser.role,
    profileImage: user?.profile_picture
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profile_picture}`
      : "/default-avatar.jpg",
  };

  const handleLogout = async () => {
    try {
      await logoutUser(dispatch);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 h-16 bg-white dark:bg-slate-700 shadow-md flex items-center px-4 transition-all duration-300 ease-in-out z-10 ${
          isSidebarOpen ? "left-16 lg:left-64" : "left-16"
        }`}
      >
        <div className="flex-1 relative hidden md:flex">
          <input
            className="outline-none w-full p-2 pl-4 pr-10 border rounded-2xl dark:bg-slate-500"
            placeholder="Search anything..."
          />
          <button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 justify-between md:justify-evenly items-center px-6">
          <ModeToggle />
          <div className="items-center justify-between gap-x-4 xl:gap-x-14 hidden lg:flex">
            <div
              onClick={() => setIsMessagesOpen(true)}
              className="cursor-pointer rounded-full relative bg-slate-300 w-12 h-12 flex items-center justify-center"
            >
              <FaRegMessage className="text-black w-7 h-7" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>

            <div
              onClick={() => router.push("/dashboard/admin/notifications")}
              className="cursor-pointer rounded-full relative bg-slate-300 w-12 h-12 flex items-center justify-center"
            >
              <IoNotificationsOutline className="text-black w-7 h-7" />
              {unreadNotificationCount > 0 && (
                <div className="absolute -top-1.5 -right-1 bg-yellow-300 rounded-full w-5 h-5 flex items-center justify-center text-xs text-black">
                  {unreadNotificationCount}
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex gap-x-4 items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={currentUser.profileImage}
                    width={48}
                    height={48}
                    className="object-cover"
                    alt={`${currentUser.fullName}'s profile`}
                    priority
                  />
                </div>
                <div className="flex flex-col text-start">
                  <h2 className="font-bold text-lg">{currentUser.fullName}</h2>
                  <h2 className="text-zinc-500">{currentUser.role}</h2>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-slate-400 shadow-lg rounded-xl">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => router.push("/dashboard/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>
                <button onClick={handleLogout}>Log Out</button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AdminChatInboxModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
      />
    </>
  );
}
