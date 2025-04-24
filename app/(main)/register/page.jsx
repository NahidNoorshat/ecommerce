"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { USER_AUTH } from "@/utils/config";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    if (["admin", "seller"].includes(formData.role)) {
      toast.error("Only customers can self-register.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${USER_AUTH}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          typeof data === "string"
            ? data
            : Object.values(data).flat().join(" ") || "Registration failed";
        throw new Error(errorMsg);
      }

      toast.success("Account created successfully!");
      router.push("/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          >
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 hover:underline">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
