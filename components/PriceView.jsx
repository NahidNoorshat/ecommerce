import React from "react";
import PriceFormatter from "./PriceFormatter";

const PriceView = ({
  originalPrice,
  displayPrice,
  discount,
  label,
  className,
}) => {
  const hasDiscount = discount && parseFloat(discount) > 0;

  return (
    <div className={`flex flex-col gap-1 ${className || ""}`}>
      {label && (
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      )}
      <div className="flex items-center gap-2">
        {hasDiscount && originalPrice !== null && (
          <span className="text-gray-500 line-through inline-flex items-center">
            <PriceFormatter amount={originalPrice} />
          </span>
        )}
        <span
          className={`
            font-semibold inline-flex items-center
            ${hasDiscount ? "text-red-600" : "text-gray-800"}
          `}
        >
          <PriceFormatter amount={displayPrice} />
        </span>
        {hasDiscount && (
          <span className="text-sm text-green-600 font-medium">
            ({parseFloat(discount).toFixed(2)}% off)
          </span>
        )}
      </div>
    </div>
  );
};

export default PriceView;
