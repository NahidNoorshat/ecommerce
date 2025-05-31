"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  setUser,
  setLoading,
  setError,
  clearUser,
} from "@/lib/feature/users/userSlice";
import { USERS_API } from "@/utils/config";
import secureAxios from "@/lib/api/secureAxios";
import { handleSessionExpiration } from "@/lib/api/auth";

export default function UserLoader() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken =
        typeof window !== "undefined" && localStorage.getItem("access");

      // ✅ Skip if no token or user already exists
      if (!accessToken || user) return;

      // ✅ Start loading
      dispatch(setLoading());

      try {
        const res = await secureAxios.get(`${USERS_API}/me/`);
        const data = res.data;

        const userData = {
          id: data.id,
          username: data.username,
          role: data.role,
          email: data.email,
          phone_number: data.phone_number,
          address: data.address,
          is_verified: data.is_verified,
          profile_picture:
            data.profile_picture?.replace(/^\/api\/newauth/, "") || null,
        };

        dispatch(setUser(userData));
      } catch (err) {
        console.error("❌ Failed to fetch user:", err);
        dispatch(setError(err.message));
        await handleSessionExpiration(dispatch); // 🚪 logout + redirect
      }
    };

    fetchUser();
  }, [dispatch, router, user]);

  return null; // no UI needed
}
