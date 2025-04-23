"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ORDERS_API } from "@/utils/config";
import { secureFetch } from "@/lib/api/secureFetch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

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
const paymentMethodOptions = ["cod", "card", "paypal", "crypto"];

export default function RecentOrders({ status = "" }) {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, [status, search, paymentStatus, paymentMethod]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (search) params.append("search", search);
      if (paymentStatus) params.append("payment_status", paymentStatus);
      if (paymentMethod) params.append("payment_method", paymentMethod);

      const res = await secureFetch(
        `${ORDERS_API}/orders/?${params.toString()}`
      );
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error("Failed to fetch orders!");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await secureFetch(`${ORDERS_API}/orders/${orderId}/update_status/`, {
      method: "POST",
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
    toast.success("Status Updated!");
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    await secureFetch(
      `${ORDERS_API}/orders/${orderId}/update_payment_status/`,
      {
        method: "POST",
        body: JSON.stringify({ payment_status: newStatus }),
      }
    );
    fetchOrders();
    toast.success("Payment Status Updated!");
  };

  const handleBulkDelete = async () => {
    await secureFetch(`${ORDERS_API}/orders/bulk_delete/`, {
      method: "POST",
      body: JSON.stringify({ order_ids: selectedOrders }),
    });
    fetchOrders();
    setSelectedOrders([]);
    toast.success("Selected Orders Deleted!");
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <Card className="p-5 shadow-md rounded-xl bg-white dark:bg-gray-900 mt-14">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold dark:text-white">
          Orders Management
        </h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search by Order ID / Customer / Phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-52"
          />
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Payment Status</option>
            {paymentStatusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Payment Method</option>
            {paymentMethodOptions.map((method) => (
              <option key={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedOrders.length > 0 && (
        <Button variant="destructive" onClick={handleBulkDelete}>
          Delete Selected
        </Button>
      )}

      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={
                    selectedOrders.length === currentOrders.length &&
                    currentOrders.length > 0
                  }
                  onChange={() =>
                    setSelectedOrders(
                      selectedOrders.length === currentOrders.length
                        ? []
                        : currentOrders.map((order) => order.order_id)
                    )
                  }
                />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.order_id)}
                      onChange={() =>
                        setSelectedOrders((prev) =>
                          prev.includes(order.order_id)
                            ? prev.filter((id) => id !== order.order_id)
                            : [...prev, order.order_id]
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>{order.order_id}</TableCell>
                  <TableCell>{order.username}</TableCell>
                  <TableCell>
                    {new Date(order.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${order.total_price}</TableCell>
                  <TableCell>
                    <Badge
                      className={paymentStatusColors[order.payment_status]}
                    >
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.payment_method}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex flex-col gap-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.order_id, e.target.value)
                      }
                      className="border p-1 rounded"
                    >
                      {orderStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {order.payment_method === "cod" && (
                      <select
                        value={order.payment_status}
                        onChange={(e) =>
                          handlePaymentStatusChange(
                            order.order_id,
                            e.target.value
                          )
                        }
                        className="border p-1 rounded"
                      >
                        {paymentStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/dashboard/admin/orders/${order.order_id}`)
                      }
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="9" className="text-center">
                  No Orders Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 mt-4">
        {currentOrders.length > 0 ? (
          currentOrders.map((order) => (
            <Card
              key={order.order_id}
              className="p-4 border rounded-lg space-y-2"
            >
              <div className="flex justify-between">
                <strong>Order:</strong>
                {order.order_id}
              </div>
              <div>
                <strong>Customer:</strong>
                {order.username}
              </div>
              <div>
                <strong>Date:</strong>
                {new Date(order.updated_at).toLocaleDateString()}
              </div>
              <div>
                <strong>Amount:</strong>${order.total_price}
              </div>
              <div>
                <strong>Payment:</strong>
                <Badge className={paymentStatusColors[order.payment_status]}>
                  {order.payment_status}
                </Badge>
              </div>
              <div>
                <strong>Status:</strong>
                <Badge className={statusColors[order.status]}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order.order_id, e.target.value)
                  }
                  className="border p-1 rounded"
                >
                  {orderStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {order.payment_method === "cod" && (
                  <select
                    value={order.payment_status}
                    onChange={(e) =>
                      handlePaymentStatusChange(order.order_id, e.target.value)
                    }
                    className="border p-1 rounded"
                  >
                    {paymentStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                )}
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/dashboard/admin/orders/${order.order_id}`)
                  }
                >
                  View
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center">No Orders Found</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }).map(
          (_, idx) => (
            <Button
              key={idx}
              size="sm"
              variant={currentPage === idx + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </Button>
          )
        )}
      </div>
    </Card>
  );
}
