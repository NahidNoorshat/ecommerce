"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { PRODUCTS_API } from "@/utils/config"; // ✅ use centralized endpoint

export default function AddCategoryModal({ onClose, refreshData }) {
  const { register, handleSubmit, reset } = useForm();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get(`${PRODUCTS_API}/categories/`)
      .then((res) => setCategories(res.data));
  }, []);

  const onSubmit = async (data) => {
    try {
      await axios.post(`${PRODUCTS_API}/categories/`, data);
      refreshData();
      onClose();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Add Category
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Name */}
          <input
            {...register("name")}
            placeholder="Category Name"
            className="border p-2 w-full rounded-md dark:bg-gray-700 dark:text-white"
            required
          />

          {/* Parent Category (Optional) */}
          <select
            {...register("parent")}
            className="border p-2 w-full rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="">No Parent (Main Category)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
