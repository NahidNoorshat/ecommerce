"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PriceFormatter from "@/components/PriceFormatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDERS_API } from "@/utils/config";
import { secureFetch } from "@/lib/api/secureFetch";
import Image from "next/image";
import Loader from "@/components/Loader";

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
        console.log("OrderDetails response:", data);

        // Validate total_price
        const subtotal = data.items.reduce(
          (sum, item) => sum + Number(item.price_at_purchase) * item.quantity,
          0
        );
        const shipping = Number(data.shipping_method?.price || 0);
        const discount = Number(data.discount_amount || 0);
        const calculatedTotal = subtotal + shipping - discount;
        if (Math.abs(calculatedTotal - Number(data.total_price)) > 0.01) {
          console.warn(
            `Total price mismatch for order ${data.order_id}: ` +
              `API=${data.total_price}, Calculated=${calculatedTotal}`
          );
        }

        setOrder(data);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Fetch order error:", err);
        }
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
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600" aria-live="assertive">
        <h2 className="text-xl font-semibold">Error: {error}</h2>
        <Button
          onClick={() => router.push("/orders")}
          aria-label="Return to orders list"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  if (!order) return null;

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price_at_purchase) * item.quantity,
    0
  );

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
                <div className="relative w-24 h-24">
                  <Image
                    src={
                      item.product.main_image?.image ||
                      "https://via.placeholder.com/150"
                    }
                    alt={item.product.main_image?.alt_text || item.product.name}
                    fill
                    className="object-cover rounded"
                    loading="lazy"
                  />
                </div>
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
              <PriceFormatter amount={subtotal} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <PriceFormatter
                amount={Number(order.shipping_method?.price || 0)}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <PriceFormatter amount={Number(order.discount_amount || 0)} />
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <PriceFormatter amount={Number(order.total_price)} />
            </div>
          </div>

          <Button
            className="mt-6"
            onClick={() => router.push("/orders")}
            aria-label="Return to orders list"
          >
            Back to My Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
