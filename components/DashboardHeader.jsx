"use client";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import Image from "next/image";
import AdminUser from "public/useradmin.jpg";
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

export default function DashboardHeader() {
  const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser(dispatch);
      router.push("/"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0  h-16 bg-white dark:bg-slate-700 shadow-md flex items-center px-4 transition-all duration-300 ease-in-out z-10 ${
        isSidebarOpen ? " left-16 lg:left-64" : "left-16"
      } `}
    >
      {/* Search Bar */}
      <div className="flex-1 relative hidden md:flex">
        <input
          className="outline-none w-full p-2 pl-4 pr-10 border rounded-2xl dark:bg-slate-500"
          placeholder="Search anything..."
        />
        {/* Search Icon */}
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

      {/* Right Section */}
      <div className="flex flex-1 justify-between md:justify-evenly items-center px-6">
        <ModeToggle />

        <div className="items-center justify-between gap-x-4 xl:gap-x-14 hidden lg:flex">
          {/* Messages */}
          <div className="rounded-full relative bg-slate-300 w-12 h-12 flex items-center justify-center">
            <FaRegMessage className="text-black w-7 h-7" />
            <div className="absolute -top-1.5 -right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-xs text-white">
              1
            </div>
          </div>
          {/* Notifications */}
          <div className="rounded-full relative bg-slate-300 w-12 h-12 flex items-center justify-center">
            <IoNotificationsOutline className="text-black w-7 h-7" />
            <div className="absolute -top-1.5 -right-1 bg-yellow-300 rounded-full w-5 h-5 flex items-center justify-center text-xs text-black">
              1
            </div>
          </div>
        </div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none ">
            <div className="flex gap-x-4 items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={AdminUser}
                  width={48}
                  height={48}
                  className="object-cover"
                  alt="Admin Image"
                />
              </div>
              <div className="flex flex-col text-start">
                <h2 className="font-bold text-lg">Abu Nahid</h2>
                <h2 className="text-zinc-500">Admin</h2>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white dark:bg-slate-400 shadow-lg rounded-xl">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>
              <button onClick={handleLogout}>Log Out</button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
