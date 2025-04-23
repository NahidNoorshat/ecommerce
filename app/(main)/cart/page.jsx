"use client";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  resetCart,
} from "@/lib/feature/card/cartSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PriceFormatter from "@/components/PriceFormatter";
import { useRouter } from "next/navigation";

const CartItem = React.memo(
  ({ item, activeAction, onIncrease, onDecrease, onRemove }) => {
    const isIncreasing = activeAction === `increase-${item.id}`;
    const isDecreasing = activeAction === `decrease-${item.id}`;
    const isRemoving = activeAction === `remove-${item.id}`;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between border p-4 rounded-md shadow-sm">
        <div className="flex items-center space-x-4">
          <img
            src={item.product.image || "/placeholder.png"}
            alt={item.product.name}
            className="w-20 h-20 object-cover rounded"
          />
          <div>
            <h3 className="text-lg font-semibold">{item.product.name}</h3>
            {item.variant && (
              <p className="text-sm text-gray-600">
                Variant:{" "}
                {item.variant.attributes &&
                Array.isArray(item.variant.attributes)
                  ? item.variant.attributes.map((attr) => attr.value).join(", ")
                  : "N/A"}
              </p>
            )}
            <p className="text-sm text-gray-600">
              Price:{" "}
              <PriceFormatter
                amount={item.variant ? item.variant.price : item.product.price}
              />
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onDecrease(item.id, item.quantity)}
              disabled={isDecreasing}
              className="px-2 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              -
            </Button>
            <span>{item.quantity}</span>
            <Button
              onClick={() => onIncrease(item.id, item.quantity)}
              disabled={
                isIncreasing ||
                item.quantity >= (item.variant?.stock || item.product.stock)
              }
              className="px-2 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              +
            </Button>
          </div>
          <p className="text-sm font-semibold">
            Subtotal:{" "}
            <PriceFormatter
              amount={
                (item.variant ? item.variant.price : item.product.price) *
                item.quantity
              }
            />
          </p>
          <Button
            onClick={() => onRemove(item.id)}
            disabled={isRemoving}
            variant="destructive"
            className="bg-red-600 text-white hover:bg-red-700 hover:text-white disabled:bg-red-300 disabled:text-white"
          >
            Remove
          </Button>
        </div>
      </div>
    );
  }
);

const CartPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, status, error, lastAction } = useSelector(
    (state) => state.cart
  );

  console.log("CartPage rendered with items:", JSON.stringify(items));

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      toast.error("Please log in to view your cart");
      router.push("/login");
    } else {
      console.log("Fetching cart with token:", token.slice(0, 10) + "...");
      dispatch(fetchCart());
    }
  }, [dispatch, router]);

  useEffect(() => {
    if (status === "succeeded" && items.length > 0) {
      console.log("Cart items updated:", items.length);
    }
  }, [items, status]);

  const handleIncrease = useCallback(
    async (cartItemId, currentQuantity) => {
      try {
        const item = items.find((i) => i.id === cartItemId);
        const stock = item.variant?.stock || item.product.stock;
        const newQuantity = currentQuantity + 1;
        console.log("Increasing cart item:", {
          id: cartItemId,
          currentQuantity,
          newQuantity,
          stock,
        });
        if (newQuantity > stock) {
          toast.info(`Maximum stock reached (${stock} available)`);
          return;
        }
        await dispatch(
          updateCartItem({ cartItemId, quantity: newQuantity })
        ).unwrap();
        toast.success("Quantity increased!");
      } catch (err) {
        console.error("Handle increase error:", err);
        const errorMessage =
          err?.data?.quantity || err.message || "Failed to update quantity";
        toast.error(errorMessage);
      }
    },
    [dispatch, items]
  );

  const handleDecrease = useCallback(
    async (cartItemId, currentQuantity) => {
      if (currentQuantity <= 1) {
        try {
          await dispatch(removeFromCart(cartItemId)).unwrap();
          toast.success("Item removed from cart");
        } catch (err) {
          toast.error(err.message || "Failed to remove item");
        }
      } else {
        try {
          await dispatch(
            updateCartItem({ cartItemId, quantity: currentQuantity - 1 })
          ).unwrap();
          toast.success("Quantity decreased!");
        } catch (err) {
          toast.error(err.message || "Failed to update quantity");
        }
      }
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    async (cartItemId) => {
      try {
        await dispatch(removeFromCart(cartItemId)).unwrap();
        toast.success("Item removed from cart");
      } catch (err) {
        toast.error(err.message || "Failed to remove item");
      }
    },
    [dispatch]
  );

  const cartTotal = items.reduce((total, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return total + price * item.quantity;
  }, 0);

  const activeAction =
    status === "loading" && lastAction
      ? `${lastAction.type}-${lastAction.cartItemId}`
      : null;

  if (status === "loading" && items.length === 0) {
    return <div className="text-center py-10">Loading cart...</div>;
  }

  if (error) {
    console.log(
      "Cart error details:",
      error,
      "Status:",
      status,
      "Items:",
      items
    );
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error.message || "Something went wrong"} (Status: {error.status}
        )
        {error.message === "Only customers can access the cart." && (
          <p className="mt-2">
            Your account may not be set as a customer. Contact support.
          </p>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Your Cart is Empty</h2>
        <Button onClick={() => router.push("/")} className="mt-4">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <div className="grid gap-6">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            activeAction={activeAction}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemove}
          />
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center border-t pt-4">
        <h2 className="text-xl font-semibold">Total:</h2>
        <PriceFormatter amount={cartTotal} className="text-xl font-bold" />
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button onClick={() => router.push("/")} variant="outline">
          Continue Shopping
        </Button>
        <Button onClick={() => router.push("/checkout")}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};

export default CartPage;
