"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const PriceRangeFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) params.set("min_price", minPrice);
    else params.delete("min_price");

    if (maxPrice) params.set("max_price", maxPrice);
    else params.delete("max_price");

    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
  }, [searchParams]);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md space-y-3">
      <h3 className="text-lg font-semibold">Filter by Price</h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <span>-</span>
        <input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      <button
        onClick={applyFilter}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
      >
        Apply
      </button>
    </div>
  );
};

export default PriceRangeFilter;
