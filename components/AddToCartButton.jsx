"use client";
import React from "react";
import { twMerge } from "tailwind-merge";
import PriceFormatter from "./PriceFormatter";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  updateCartItem,
  removeFromCart,
} from "@/lib/feature/card/cartSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const AddToCartButton = React.memo(({ product, className }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  console.log(
    `Rendering AddToCartButton for ${product.name}, timestamp: ${Date.now()}`
  );
  console.log(`Product ref for ${product.name}:`, product);

  const getCheapestVariant = (variants) => {
    if (!variants || variants.length === 0) return null;
    const validVariants = variants.filter((v) => v.stock > 0);
    if (validVariants.length === 0) return null;
    return validVariants.reduce((min, curr) =>
      parseFloat(curr.final_price) < parseFloat(min.final_price) ? curr : min
    );
  };

  const selectedVariant = product.has_variants
    ? product.selectedVariant || getCheapestVariant(product.variants)
    : null;

  const { cartItem, isLoading } = useSelector(
    (state) => {
      const item = state.cart.items.find((item) => {
        const productMatch = item.product.id === product.id;
        const variantMatch = selectedVariant
          ? item.variant?.id === selectedVariant.id
          : !item.variant;
        return productMatch && variantMatch;
      });
      return {
        cartItem: item,
        isLoading:
          state.cart.status === "loading" &&
          state.cart.lastAction?.productId === product.id &&
          (!selectedVariant ||
            state.cart.lastAction?.variantId === selectedVariant.id),
      };
    },
    (prev, next) =>
      prev.cartItem?.id === next.cartItem?.id &&
      prev.cartItem?.quantity === next.cartItem?.quantity &&
      prev.isLoading === next.isLoading
  );

  const effectiveStock = selectedVariant
    ? selectedVariant.stock
    : product.stock;
  const effectivePrice = selectedVariant
    ? selectedVariant.price
    : product.price;
  const isOutOfStock = effectiveStock === 0;

  const itemCount = cartItem ? cartItem.quantity : 0;
  const cartItemId = cartItem ? cartItem.id : null;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("This product is out of stock.");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      toast.error("Please log in to add items to your cart");
      router.push("/login");
      return;
    }

    const payload = { productId: product.id, quantity: 1 };
    if (product.has_variants && selectedVariant?.id) {
      payload.variantId = selectedVariant.id;
    }
    try {
      await dispatch(addToCart(payload)).unwrap();
      toast.success(
        `${product.name} ${
          itemCount > 0 ? "quantity updated!" : "added to cart!"
        }`
      );
    } catch (error) {
      const errorMsg =
        error?.data?.message || error.message || "Failed to add to cart";
      toast.error(errorMsg);
      if (error.status === 401) {
        toast.info("Session expired. Redirecting to login...");
        router.push("/login");
      }
    }
  };

  const handleIncrease = async () => {
    try {
      if (cartItem) {
        const newQuantity = cartItem.quantity + 1;
        const stock = cartItem.variant?.stock || cartItem.product.stock;
        console.log("Increasing cart item:", {
          id: cartItem.id,
          currentQuantity: cartItem.quantity,
          newQuantity,
          stock,
        });
        if (newQuantity > stock) {
          toast.info(`Maximum stock reached (${stock} available)`);
          return;
        }
        const result = await dispatch(
          updateCartItem({ cartItemId: cartItem.id, quantity: newQuantity })
        ).unwrap();
        toast.success("Quantity increased!");
      } else {
        const payload = { productId: product.id, quantity: 1 };
        if (product.has_variants && selectedVariant?.id) {
          payload.variantId = selectedVariant.id;
        }
        await dispatch(addToCart(payload)).unwrap();
        toast.success("Added to cart!");
      }
    } catch (error) {
      console.error("Handle increase error:", error);
      const errorMessage =
        error?.data?.quantity || error.message || "Failed to update quantity";
      toast.error(errorMessage);
    }
  };

  const handleDecrease = async () => {
    if (!cartItemId) {
      toast.error("Invalid cart item ID");
      return;
    }
    try {
      if (itemCount <= 1) {
        await dispatch(removeFromCart(cartItemId)).unwrap();
        toast.success("Item removed from cart.");
      } else {
        const newQuantity = itemCount - 1;
        console.log("Decreasing cart item:", {
          id: cartItemId,
          currentQuantity: itemCount,
          newQuantity,
          stock: cartItem.variant?.stock || cartItem.product.stock,
        });
        await dispatch(
          updateCartItem({ cartItemId, quantity: newQuantity })
        ).unwrap();
        toast.success("Quantity decreased!");
      }
    } catch (error) {
      console.error("Handle decrease error:", error);
      const errorMessage =
        error?.data?.quantity ||
        error?.detail ||
        error.message ||
        "Failed to decrease quantity";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="h-12">
      {itemCount > 0 ? (
        <div className="text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quantity</span>
            <div className="flex items-center gap-2">
              <Button onClick={handleDecrease} disabled={isLoading}>
                -
              </Button>
              <span>{itemCount}</span>
              <Button
                onClick={handleIncrease}
                disabled={
                  isLoading || (cartItem && cartItem.quantity >= effectiveStock)
                }
              >
                +
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Subtotal</span>
            <PriceFormatter
              amount={effectivePrice ? effectivePrice * itemCount : 0}
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock}
          className={twMerge(
            "bg-darkBlue/10 border text-black border-darkBlue w-full py-2 mt-2 rounded-md font-medium hover:bg-darkBlue hover:text-white hoverEffect disabled:hover:cursor-not-allowed disabled:hover:bg-darkBlue/10 disabled:text-gray-400 disabled:hover:text-gray-400 disabled:border-darkBlue/10",
            className
          )}
        >
          {isLoading ? "Adding..." : "Add to Cart"}
        </Button>
      )}
    </div>
  );
});

export default AddToCartButton;
