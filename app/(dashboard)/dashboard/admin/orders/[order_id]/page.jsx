"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PriceFormatter from "@/components/PriceFormatter";
import { toast } from "sonner";
import { ORDERS_API } from "@/utils/config";

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
const orderStatusOptions = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const paymentStatusOptions = ["pending", "paid", "failed", "refunded"];

export default function AdminOrderDetailsPage() {
  const { order_id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [order_id]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${ORDERS_API}/orders/${order_id}/details/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (field, value) => {
    const url = `${ORDERS_API}/orders/${order_id}/${field}/`;
    try {
      await axios.post(
        url,
        { [field === "update_status" ? "status" : "payment_status"]: value },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      toast.success(`${field.replace("_", " ")} updated!`);
      fetchOrder();
    } catch {
      toast.error(`Failed to update ${field.replace("_", " ")}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await axios.delete(`${ORDERS_API}/orders/${order_id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      toast.success("Order deleted successfully");
      router.push("/dashboard/admin/orders/all");
    } catch {
      toast.error("Failed to delete order");
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!order) return null;

  return (
    <div className="container mx-auto py-6 px-4 mt-14 ">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Order #{order.order_id}
          </CardTitle>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge className={statusColors[order.status]}>{order.status}</Badge>
            <Badge className={paymentStatusColors[order.payment_status]}>
              {order.payment_status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-4 border rounded-lg p-4 items-center"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h2 className="font-semibold">{item.product.name}</h2>
                <p className="text-sm text-gray-600">
                  {item.product.description?.slice(0, 80)}...
                </p>
                <p className="text-sm">Qty: {item.quantity}</p>
                <PriceFormatter
                  amount={item.price_at_purchase}
                  className="font-semibold"
                />
              </div>
            </div>
          ))}

          <div className="border-t pt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <PriceFormatter
                amount={
                  Number(order.total_price) + Number(order.discount_amount)
                }
              />
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <PriceFormatter amount={order.discount_amount} />
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <PriceFormatter amount={order.total_price} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
            <p className="text-sm">
              {order.shipping_address?.address_line_1},{" "}
              {order.shipping_address?.city}, {order.shipping_address?.state},{" "}
              {order.shipping_address?.country} -{" "}
              {order.shipping_address?.postal_code}
            </p>
            <p className="text-sm">Phone: {order.shipping_address?.phone}</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <select
              value={order.status}
              onChange={(e) => updateOrder("update_status", e.target.value)}
              className="border p-2 rounded"
            >
              {orderStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={order.payment_status}
              onChange={(e) =>
                updateOrder("update_payment_status", e.target.value)
              }
              className="border p-2 rounded"
            >
              {paymentStatusOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
            {order.status !== "cancelled" && (
              <Button
                variant="outline"
                onClick={() => updateOrder("update_status", "cancelled")}
              >
                Cancel Order
              </Button>
            )}
            <Button onClick={() => router.push("/dashboard/admin/orders/all")}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
