// lib/api/reviews.js

import api from "./api"; // your axios instance

export async function submitReview(data) {
  try {
    const response = await api.post("/reviews/", data);
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to submit review");
  }
}
