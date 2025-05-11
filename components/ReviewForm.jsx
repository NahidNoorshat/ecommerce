"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitReview } from "@/lib/api/reviews"; // make sure this is correct path

export default function ReviewForm({
  productId,
  userToken,
  onReviewSubmit,
  mutate,
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitReview({ product: productId, rating, comment }, userToken);
      toast.success("Review submitted!");
      setRating(5);
      setComment("");
      mutate(); // ✅ refresh reviews
      onReviewSubmit?.();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Rating
        </label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 p-2 border border-gray-300 rounded w-full"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-1 p-2 border border-gray-300 rounded w-full"
          placeholder="Share your thoughts..."
        />
      </div>

      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
      >
        Submit Review
      </button>
    </form>
  );
}
