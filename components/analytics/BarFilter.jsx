"use client";
import { useState } from "react";

const options = ["weekly", "monthly", "all"];

export default function BarFilter({ onChange }) {
  const [active, setActive] = useState("all");

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          className={`px-3 py-1 rounded-full text-sm border transition ${
            active === opt ? "bg-black text-white" : "bg-white text-black"
          }`}
          onClick={() => {
            setActive(opt);
            onChange(opt);
          }}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
}
