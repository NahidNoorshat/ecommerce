"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/feature/users/userSlice";
import { USER_AUTH } from "@/utils/config";
import { toast } from "sonner";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${USER_AUTH}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Login failed");

      // Store tokens
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // Set user in Redux
      dispatch(
        setUser({
          username: data.username,
          email: data.email,
          role: data.role,
        })
      );

      toast.success("Login successful!");
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-3 mt-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 mt-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 mt-4 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p>
            Don't have an account?{" "}
            <a href="/register" className="text-indigo-600 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
