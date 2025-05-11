"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { markNotificationRead } from "@/lib/feature/notifications/notificationSlice";
import secureAxios from "@/lib/api/secureAxios";
import { NOTIFICATIONS_API } from "@/utils/config";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NotificationList({ showReviewButton = false }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const notifications = useSelector((state) => state.notifications.items);
  const [openDialogId, setOpenDialogId] = useState(null);

  if (!user || !user.username) {
    router.push("/login");
    return null;
  }

  const handleOpenDialog = async (id) => {
    try {
      await secureAxios.patch(
        `${NOTIFICATIONS_API}/notifications/${id}/mark-read/`
      );
      dispatch(markNotificationRead(id));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleGoToReview = (slug) => {
    setOpenDialogId(null);
    setTimeout(() => {
      router.push(`/product/${slug}`);
    }, 300);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <Dialog
              key={n.id}
              open={openDialogId === n.id}
              onOpenChange={(open) => {
                if (open) {
                  setOpenDialogId(n.id);
                  handleOpenDialog(n.id);
                } else {
                  setOpenDialogId(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <li
                  className={`p-4 border rounded-md shadow-sm cursor-pointer ${
                    !n.is_read ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </li>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{n.title}</DialogTitle>
                  <DialogDescription className="text-sm text-gray-700 mt-2">
                    {n.message}
                  </DialogDescription>

                  {showReviewButton &&
                    n.notification_type === "review" &&
                    n.product_slug && (
                      <button
                        onClick={() => handleGoToReview(n.product_slug)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Go to Review
                      </button>
                    )}
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
        </ul>
      )}
    </div>
  );
}
