import React from "react";

const PriceView = ({
  originalPrice,
  displayPrice,
  discount,
  label,
  className,
}) => {
  const hasDiscount = discount && parseFloat(discount) > 0;
  const formattedOriginal =
    originalPrice !== null ? `$${parseFloat(originalPrice).toFixed(2)}` : "N/A";
  const formattedFinal =
    displayPrice !== null ? `$${parseFloat(displayPrice).toFixed(2)}` : "N/A";
  const formattedDiscount = hasDiscount
    ? `${parseFloat(discount).toFixed(2)}% off`
    : null;

  return (
    <div className={`flex flex-col gap-1 ${className || ""}`}>
      {label && (
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      )}
      <div className="flex items-center gap-2">
        {hasDiscount && originalPrice !== null && (
          <span className="text-gray-500 line-through">
            {formattedOriginal}
          </span>
        )}
        <span
          className={`font-semibold ${
            hasDiscount ? "text-red-600" : "text-gray-800"
          }`}
        >
          {formattedFinal}
        </span>
        {hasDiscount && formattedDiscount && (
          <span className="text-sm text-green-600 font-medium">
            ({formattedDiscount})
          </span>
        )}
      </div>
    </div>
  );
};

export default PriceView;
