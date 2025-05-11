import useSWR from "swr";
import { REVIEWS_API } from "@/utils/config";

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
};

export default function useReviews(productId) {
  const shouldFetch = !!productId;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `${REVIEWS_API}/?product=${productId}` : null,
    fetcher
  );

  return {
    reviews: data || [],
    isLoading,
    isError: !!error,
    mutate, // to re-fetch manually after submitting a review
  };
}
