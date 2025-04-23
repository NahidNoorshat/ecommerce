"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const UNIT_CHOICES = [
  { value: "PCS", label: "Pieces" },
  { value: "KG", label: "Kilogram" },
  { value: "L", label: "Liter" },
  { value: "M", label: "Meter" },
  { value: "G", label: "Gram" },
  { value: "BOX", label: "Box" },
  { value: "OTHER", label: "Other (Specify)" },
];

export default function AddProductModal({ onClose, refreshData }) {
  const { register, handleSubmit, watch, reset, setValue } = useForm();
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    axios
      .get("http://13.51.157.149/api/products/categories/")
      .then((res) => setCategories(res.data));
  }, []);

  const selectedUnit = watch("unit");

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("stock", data.stock);
      formData.append("category", data.category);
      formData.append("unit", data.unit);

      if (data.unit === "OTHER") {
        formData.append("custom_unit", data.custom_unit);
      }

      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]); // Attach the image file
      }

      await axios.post(
        "http://13.51.157.149/api/products/products/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      refreshData();
      onClose();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 dark:text-white p-6 rounded shadow-md w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Add Product</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("name")}
            placeholder="Product Name"
            className="border p-2 w-full dark:bg-gray-800 dark:border-gray-700"
            required
          />

          <textarea
            {...register("description")}
            placeholder="Description"
            className="border p-2 w-full dark:bg-gray-800 dark:border-gray-700"
            required
          />

          <input
            {...register("price")}
            type="number"
            placeholder="Price"
            className="border p-2 w-full dark:bg-gray-800 dark:border-gray-700"
            required
          />

          <input
            {...register("stock")}
            type="number"
            placeholder="Stock"
            className="border p-2 w-full dark:bg-gray-800 dark:border-gray-700"
            required
          />

          {/* Category Selection */}
          <select
            {...register("category")}
            className="border p-2 w-full dark:bg-gray-800 dark:border-gray-700"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Unit Selection */}
          <select
            {...register("unit")}
            className="border p-2 w-full dark:bg-gray-800 dark:border-gray-700"
            required
          >
            {UNIT_CHOICES.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>

          {/* Custom Unit Field (Only if "Other" is selected) */}
          {selectedUnit === "OTHER" && (
            <input
              {...register("custom_unit")}
              placeholder="Enter custom unit"
              className="border p-2 w-full dark:bg-gray-800 dark:border-gray-700"
              required
            />
          )}

          {/* Image Upload */}
          <input
            type="file"
            {...register("image")}
            accept="image/*"
            className="border p-2 w-full dark:bg-gray-800 dark:border-gray-700"
            onChange={(e) => {
              if (e.target.files[0]) {
                setImagePreview(URL.createObjectURL(e.target.files[0]));
              } else {
                setImagePreview(null);
              }
            }}
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Product Preview"
                className="w-full max-h-40 object-cover rounded border dark:border-gray-700"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white p-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
