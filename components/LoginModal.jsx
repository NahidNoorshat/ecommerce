"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideLoginModal } from "@/lib/feature/auth/loginModalSlice";
import { setUser } from "@/lib/feature/users/userSlice";
import { USER_AUTH } from "@/utils/config";
import { toast } from "sonner";

const LoginModal = () => {
  const isOpen = useSelector((state) => state.loginModal.open);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${USER_AUTH}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      const user = data.user;
      dispatch(
        setUser({
          id: user.id,
          username: user.username,
          role: user.role,
          profile_picture: user.profile_picture,
        })
      );

      toast.success("Login successful!");
      dispatch(hideLoginModal());
    } catch (err) {
      toast.error("Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Login to Continue</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
