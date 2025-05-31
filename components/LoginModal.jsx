"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideLoginModal } from "@/lib/feature/auth/loginModalSlice";
import { setUser } from "@/lib/feature/users/userSlice";
import { USER_AUTH } from "@/utils/config";
import { toast } from "sonner";
import Link from "next/link";

const LoginModal = () => {
  const isOpen = useSelector((state) => state.loginModal.open);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: "",
  });
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        dispatch(hideLoginModal());
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, dispatch]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modalRef.current.addEventListener("keydown", handleTab);
    return () => modalRef.current?.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ username: "", password: "", general: "" });

    try {
      const res = await fetch(`${USER_AUTH}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.username || data.password) {
          setErrors({
            username: data.username?.[0] || "",
            password: data.password?.[0] || "",
            general: "",
          });
        } else if (
          data.detail === "No active account found with the given credentials"
        ) {
          setErrors({
            username: "Invalid username or password",
            password: "Invalid username or password",
            general: "",
          });
        } else {
          setErrors({
            username: "",
            password: "",
            general: data.detail || "Login failed",
          });
        }
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
      setErrors({
        username: "",
        password: "",
        general: "An error occurred. Please try again.",
      });
      toast.error("Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative"
      >
        <button
          onClick={() => dispatch(hideLoginModal())}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
          aria-label="Close modal"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Login to Continue
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={firstInputRef}
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-gray-200"
              disabled={loading}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "username-error" : undefined}
            />
            {errors.username && (
              <p id="username-error" className="text-red-500 text-xs mt-1">
                {errors.username}
              </p>
            )}
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-gray-200"
              disabled={loading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>
          {errors.general && (
            <p className="text-red-500 text-xs text-center">{errors.general}</p>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
            onClick={() => dispatch(hideLoginModal())}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
