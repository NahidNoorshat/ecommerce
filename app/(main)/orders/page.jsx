"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PriceFormatter from "@/components/PriceFormatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ORDERS_API } from "@/utils/config";
import { secureFetch } from "@/lib/api/secureFetch"; // ✅ Token refresh handler

const OrdersPage = () => {
  const router = useRouter();
  const { status } = useSelector((state) => state.cart);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await secureFetch(`${ORDERS_API}/orders/`);
        if (!res || !res.ok)
          throw new Error("Unauthorized or session expired.");

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const statusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="text-center py-20 text-lg">Loading your orders...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-red-600">Error: {error}</h2>
        <Button onClick={() => router.push("/")} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-semibold">No Orders Yet</h2>
        <p className="mt-2 text-gray-500">
          Start shopping to see your orders here!
        </p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Shop Now
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>
      <div className="grid gap-6">
        {orders.map((order) => (
          <Card
            key={order.order_id}
            className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center">
              <CardTitle className="text-xl font-semibold">
                Order #{order.order_id}
              </CardTitle>
              <Badge
                className={`text-sm font-medium capitalize ${statusColor(
                  order.status
                )}`}
              >
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="text-gray-500">Date</p>
                <p>{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Subtotal</p>
                <PriceFormatter
                  amount={
                    Number(order.total_price) + Number(order.discount_amount)
                  }
                />
              </div>
              <div>
                <p className="text-gray-500">Discount</p>
                <PriceFormatter amount={Number(order.discount_amount)} />
              </div>
              <div>
                <p className="text-gray-500">Total</p>
                <PriceFormatter
                  amount={Number(order.total_price)}
                  className="font-semibold text-black"
                />
              </div>

              <div className="col-span-full pt-4">
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => router.push(`/orders/${order.order_id}`)}
                >
                  View Order Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button onClick={() => router.push("/")} size="lg">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};

export default OrdersPage;
