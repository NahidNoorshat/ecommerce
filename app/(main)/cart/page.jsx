"use client";

import React, { useCallback, useEffect, useMemo } from "react";
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
import Image from "next/image";

const CartItem = React.memo(
  ({ item, activeAction, onIncrease, onDecrease, onRemove }) => {
    const isIncreasing = activeAction === `increase-${item.id}`;
    const isDecreasing = activeAction === `decrease-${item.id}`;
    const isRemoving = activeAction === `remove-${item.id}`;

    // Use main_image.image with a fallback
    const productImage =
      item.product.main_image?.image || "https://via.placeholder.com/150";

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between border p-4 rounded-md shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20">
            <Image
              src={productImage}
              alt={item.product.main_image?.alt_text || item.product.name}
              fill
              className="object-cover rounded"
              loading="lazy"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{item.product.name}</h3>
            {item.variant && (
              <p className="text-sm text-gray-600">
                Variant:{" "}
                {item.variant.attributes &&
                Array.isArray(item.variant.attributes)
                  ? item.variant.attributes
                      .map((attr) => attr.value ?? "N/A")
                      .join(", ")
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
              aria-label={`Decrease quantity of ${item.product.name}`}
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
              aria-label={`Increase quantity of ${item.product.name}`}
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
            aria-label={`Remove ${item.product.name} from cart`}
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

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      toast.error("Please log in to view your cart");
      dispatch(resetCart());
      router.push("/login");
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log("Fetching cart with token:", token.slice(0, 10) + "...");
      }
      dispatch(fetchCart());
    }
  }, [dispatch, router]);

  useEffect(() => {
    if (error?.status === "401") {
      toast.error(error.message);
      localStorage.removeItem("access");
      dispatch(resetCart());
      router.push("/login");
    }
  }, [error, router, dispatch]);

  const handleIncrease = useCallback(
    async (cartItemId, currentQuantity) => {
      try {
        const item = items.find((i) => i.id === cartItemId);
        const stock = item.variant?.stock || item.product.stock;
        const newQuantity = currentQuantity + 1;
        if (newQuantity > stock) {
          toast.info(`Maximum stock reached (${stock} available)`);
          return;
        }
        await dispatch(
          updateCartItem({ cartItemId, quantity: newQuantity })
        ).unwrap();
        toast.success("Quantity increased!");
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Handle increase error:", err);
        }
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

  const cartTotal = useMemo(
    () =>
      items.reduce((total, item) => {
        const price = item.variant ? item.variant.price : item.product.price;
        return total + price * item.quantity;
      }, 0),
    [items]
  );

  const handleCheckout = () => {
    const outOfStockItems = items.filter(
      (item) => item.quantity > (item.variant?.stock || item.product.stock)
    );
    if (outOfStockItems.length > 0) {
      toast.error(
        `Some items are out of stock: ${outOfStockItems
          .map((item) => item.product.name)
          .join(", ")}`
      );
      return;
    }
    router.push("/checkout");
  };

  const activeAction =
    status === "loading" && lastAction
      ? `${lastAction.type}-${lastAction.cartItemId}`
      : null;

  if (status === "loading" && items.length === 0) {
    return (
      <div className="text-center py-10" aria-live="polite">
        Loading cart...
      </div>
    );
  }

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Cart error details:",
        error,
        "Status:",
        status,
        "Items:",
        items
      );
    }
    return (
      <div className="text-center py-10 text-red-500" aria-live="assertive">
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
        <Button onClick={handleCheckout}>Proceed to Checkout</Button>
      </div>
    </div>
  );
};

export default CartPage;
