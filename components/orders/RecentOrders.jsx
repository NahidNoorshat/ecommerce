"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import axios from "axios";

const statusColors = {
  pending: "bg-yellow-500 text-white",
  processing: "bg-blue-500 text-white",
  shipped: "bg-purple-500 text-white",
  delivered: "bg-green-500 text-white",
  cancelled: "bg-red-500 text-white",
};

const paymentStatusColors = {
  pending: "bg-gray-500 text-white",
  paid: "bg-green-500 text-white",
  failed: "bg-red-500 text-white",
  refunded: "bg-blue-500 text-white",
};

export default function RecentOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/orders/orders/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        setOrders(response.data);
        console.log(response.data, "This is order details..");
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <Card className="p-5 shadow-md rounded-xl bg-white dark:bg-gray-900">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        Recent Orders
      </h2>

      {/* Table View for Large Screens */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount ($)</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order?.order_id}>
                  <TableCell>{order?.order_id}</TableCell>
                  <TableCell>{order?.username}</TableCell>
                  <TableCell>
                    {new Date(order?.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${order?.total_price}</TableCell>
                  <TableCell>
                    <Badge
                      className={`px-3 py-1 rounded-lg ${
                        paymentStatusColors[order?.payment_status]
                      }`}
                    >
                      {order?.payment_status?.charAt(0)?.toUpperCase() +
                        order?.payment_status?.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`px-3 py-1 rounded-lg ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-gray-500 dark:text-gray-400"
                >
                  No recent orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Card View for Mobile */}
      <div className="block md:hidden">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order?.order_id} className="mb-4 p-4 shadow-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Order ID: {order?.order_id}
                </h3>
                <Badge className={`px-3 py-1 ${statusColors[order?.status]}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-500 text-sm">
                Customer: {order?.customer}
              </p>
              <p className="text-gray-500 text-sm">
                Date: {new Date(order?.date).toLocaleDateString()}
              </p>
              <p className="text-gray-700 font-semibold">
                Amount: ${order?.total_price}
              </p>
              <Badge
                className={`mt-2 px-3 py-1 ${
                  paymentStatusColors[order?.payment_status]
                }`}
              >
                {order?.payment_status.charAt(0).toUpperCase() +
                  order?.payment_status.slice(1)}
              </Badge>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No recent orders found.
          </p>
        )}
      </div>
    </Card>
  );
}
