// components/ProductReviews.jsx

import useReviews from "@/hooks/useReviews";

export default function ProductReviews({ productId }) {
  const { reviews, isLoading, isError } = useReviews(productId);

  if (isLoading) return <p className="text-gray-500">Loading reviews...</p>;
  if (isError) return <p className="text-red-500">Failed to load reviews.</p>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2">Customer Reviews</h3>
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="border p-3 rounded shadow-sm">
              <div className="flex justify-between">
                <strong>{review.user}</strong>
                <span className="text-yellow-500">⭐ {review.rating}</span>
              </div>
              <p className="text-gray-700 mt-1">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
