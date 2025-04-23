// components/analytics/AnalyticsFilter.jsx
"use client";

import { useState } from "react";

const FILTERS = ["daily", "weekly", "monthly"];

export default function AnalyticsFilter({ onChange }) {
  const [active, setActive] = useState("weekly");

  const handleClick = (filter) => {
    setActive(filter);
    onChange(filter);
  };

  return (
    <div className="flex gap-2 mb-4">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          onClick={() => handleClick(filter)}
          className={`px-4 py-1 text-sm rounded-full border transition-all ${
            active === filter
              ? "bg-black text-white"
              : "bg-white text-black border-gray-300"
          }`}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>
  );
}
