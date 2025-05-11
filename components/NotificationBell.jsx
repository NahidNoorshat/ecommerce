"use client";

import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useMemo } from "react";

const NotificationBell = () => {
  const notifications = useSelector((state) => state.notifications.items);
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);
  const recentNotifications = notifications.slice(0, 5);
  useEffect(() => {
    console.log("🔔 Rerendered NotificationBell with:", notifications);
  }, [notifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="flex items-center text-sm gap-1 border border-gray-200 px-1.5 py-1 rounded-md shadow-md hover:shadow-none hoverEffect relative cursor-pointer"
          role="button"
          aria-label="Open notification dropdown"
        >
          <Bell className="text-xl text-darkBlue" />
          <div className="flex flex-col">
            <p className="text-xs">Alerts</p>
            <p className="font-semibold text-sm">Notifs</p>
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-2">
        <p className="text-sm font-semibold px-1 pb-1">Notifications</p>
        <DropdownMenuSeparator />

        {recentNotifications.length === 0 ? (
          <p className="text-gray-500 text-sm px-2 py-1">No notifications</p>
        ) : (
          recentNotifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex flex-col items-start gap-0.5 ${
                !n.is_read ? "bg-gray-100" : ""
              }`}
            >
              <p className="text-xs font-medium">{n.title}</p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[230px]">
                {n.message}
              </p>
              <p className="text-[10px] text-gray-400">
                {formatDistanceToNow(new Date(n.created_at), {
                  addSuffix: true,
                })}
              </p>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className="w-full text-center text-sm text-blue-600 hover:underline"
          >
            View all notifications →
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
