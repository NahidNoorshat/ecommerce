import NotificationList from "@/components/notifications/NotificationList";

export default function AdminNotificationsPage() {
  return (
    <div className="my-14 max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <NotificationList />
    </div>
  );
}
