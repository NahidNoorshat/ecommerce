"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setError, clearUser } from "@/lib/feature/users/userSlice";
import { USER_AUTH } from "@/utils/config";
import { secureFetch } from "@/lib/api/secureFetch";

export default function UserLoader() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("access");

      if (accessToken && !user) {
        try {
          const res = await secureFetch(`${USER_AUTH}/user/`);
          if (!res || !res.ok)
            throw new Error("Session expired or unauthorized.");

          const data = await res.json();
          dispatch(setUser(data));
        } catch (err) {
          console.error("Failed to fetch user details:", err);
          dispatch(setError(err.message));
          dispatch(clearUser());
        }
      }
    };

    fetchUser();
  }, [dispatch, user]);

  return null;
}
