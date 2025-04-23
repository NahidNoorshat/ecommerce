"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import PriceFormatter from "@/components/PriceFormatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDERS_API } from "@/utils/config";
import { secureFetch } from "@/lib/api/secureFetch";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await secureFetch(`${ORDERS_API}/orders/${orderId}/`);
        if (!res.ok) {
          throw new Error("Failed to fetch order details.");
        }
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message || "Failed to load order.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-10">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        <h2 className="text-xl font-semibold">Error: {error}</h2>
        <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Order #{order.order_id}
          </CardTitle>
          <p className="text-gray-500 text-sm">Status: {order.status}</p>
        </CardHeader>
        <CardContent>
          <div className="mt-4 grid gap-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 items-start border p-4 rounded-lg shadow-sm"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.product.name}</h2>
                  <p className="text-sm text-gray-600 mb-1">
                    {item.product.description?.slice(0, 100)}...
                  </p>
                  <p className="text-sm">Qty: {item.quantity}</p>
                  <PriceFormatter
                    amount={item.price_at_purchase}
                    className="font-bold"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <PriceFormatter
                amount={
                  Number(order.total_price) + Number(order.discount_amount)
                }
              />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <PriceFormatter amount={order.discount_amount} />
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <PriceFormatter amount={order.total_price} />
            </div>
          </div>

          <Button className="mt-6" onClick={() => router.push("/orders")}>
            Back to My Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
