"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USERS_API, ORDERS_API, SHIPPIN_API } from "@/utils/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import { secureFetch } from "@/lib/api/secureFetch";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/lib/api/auth";

export default function CustomerProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, ordersRes, addressRes] = await Promise.all([
          secureFetch(`${USERS_API}/users/me/`),
          secureFetch(`${ORDERS_API}/orders/`),
          secureFetch(`${SHIPPIN_API}/addresses/`),
        ]);

        const userData = await userRes.json();
        const ordersData = await ordersRes.json();
        const addressesData = await addressRes.json();

        setUser(userData);
        setOrders(ordersData.slice(0, 3));
        setAddresses(addressesData);
      } catch (err) {
        setError("Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return <div className="text-center py-10">Loading profile...</div>;

  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        <p>Error: {error}</p>
      </div>
    );

  return (
    <div className="container mx-auto py-10 px-4 grid gap-6">
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={user?.profile_picture || ""}
                alt={user.username}
              />
              <AvatarFallback>
                <UserIcon className="w-6 h-6 text-gray-500" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p>
                <strong>Name:</strong> {user.username}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone_number}
              </p>
              <p>
                <strong>Address:</strong> {user.address || "No address added"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/account/settings")}
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order.order_id} className="border p-3 rounded">
                <p>
                  <strong>Order #{order.order_id}</strong> - {order.status}
                </p>
                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                <p>Total: ${order.total_price}</p>
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/orders/${order.order_id}`)}
                >
                  View Details
                </Button>
              </div>
            ))
          )}
          <Button className="mt-2" onClick={() => router.push("/orders")}>
            View All Orders
          </Button>
        </CardContent>
      </Card>

      {/* Shipping Addresses */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.length === 0 ? (
            <p>No saved addresses.</p>
          ) : (
            addresses.map((addr, i) => (
              <div key={i} className="border p-3 rounded">
                <p>
                  {addr.address_line_1}, {addr.city}, {addr.state}
                </p>
                <p>
                  {addr.country} - {addr.postal_code}
                </p>
                <p>Phone: {addr.phone}</p>
              </div>
            ))
          )}
          <Button
            className="mt-2"
            onClick={() => router.push("/account/address")}
          >
            Manage Addresses
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => router.push("/account/change-password")}
          >
            Change Password
          </Button>
          <Button
            variant="destructive"
            className="ml-4"
            onClick={async () => {
              await logoutUser(dispatch); // clears tokens
              router.push("/"); // redirect to homepage
            }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
