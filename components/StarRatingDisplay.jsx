"use client";

import { LuStar } from "react-icons/lu";

export default function StarRatingDisplay({
  rating = 0,
  size = 16,
  showValue = true,
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const full = index + 1 <= rating;
        const half = index + 0.5 <= rating && index + 1 > rating;

        return (
          <LuStar
            key={index}
            size={size}
            className={full || half ? "text-orange-400" : "text-gray-400"}
            fill={full ? "#fca99b" : half ? "#fca99b80" : "transparent"}
          />
        );
      })}
      {showValue && (
        <span className="text-xs text-gray-500 ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}
