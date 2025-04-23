"use client";

import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setError, clearUser } from "@/lib/feature/users/userSlice";

export default function UserLoader() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user); // Get user from Redux state

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("access");

      // Only fetch user details if the user is not already logged in
      if (accessToken && !user) {
        try {
          const response = await axios.get(
            "http://13.51.157.149/api/newauth/user/",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          dispatch(setUser(response.data)); // Store user details in Redux
        } catch (err) {
          console.error("Failed to fetch user details:", err);
          dispatch(setError(err.message)); // Set error in Redux
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          dispatch(clearUser()); // Clear user details in Redux
        }
      }
    };

    fetchUser();
  }, [dispatch, user]);

  return null; // This component doesn't render anything
}
