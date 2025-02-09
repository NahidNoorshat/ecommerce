"use client";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import PriceFormatter from "./PriceFormatter";
import { Button } from "./ui/button";

const AddToCartButton = ({ product, className }) => {
  const [itemCount, setItemCount] = useState(0);
  const isOutOfStock = product?.stock === 0;

  const handleAddToCart = () => {
    setItemCount((prevCount) => prevCount + 1);
    console.log(`${product?.name} added to cart!`);
  };

  const handleIncrease = () => setItemCount((prevCount) => prevCount + 1);
  const handleDecrease = () =>
    setItemCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));

  return (
    <div className="h-12">
      {itemCount > 0 ? (
        <div className="text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quantity</span>
            <div className="flex items-center gap-2">
              <Button onClick={handleDecrease}>-</Button>
              <span>{itemCount}</span>
              <Button onClick={handleIncrease}>+</Button>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Subtotal</span>
            <PriceFormatter
              amount={product?.price ? product.price * itemCount : 0}
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={twMerge(
            "bg-darkBlue/10 border text-black border-darkBlue w-full py-2 mt-2 rounded-md font-medium hover:bg-darkBlue hover:text-white hoverEffect disabled:hover:cursor-not-allowed disabled:hover:bg-darkBlue/10 disabled:text-gray-400 disabled:hover:text-gray-400 disabled:border-darkBlue/10",
            className
          )}
        >
          Add to cart
        </Button>
      )}
    </div>
  );
};

export default AddToCartButton;
