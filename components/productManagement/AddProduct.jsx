"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

const UNIT_CHOICES = [
  { value: "PCS", label: "Pieces" },
  { value: "KG", label: "Kilogram" },
  { value: "L", label: "Liter" },
  { value: "M", label: "Meter" },
  { value: "G", label: "Gram" },
  { value: "BOX", label: "Box" },
  { value: "OTHER", label: "Other (Specify)" },
];

export default function ProductForm() {
  const { register, handleSubmit, control, watch, setValue } = useForm();
  const selectedUnit = watch("unit");

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      price: data.price,
      stock: data.stock,
      unit: data.unit,
      custom_unit: data.unit === "OTHER" ? data.custom_unit : null, // Only send if selected
    };

    const response = await fetch(
      "http://127.0.0.1:8000/api/products/products/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      alert("Product added successfully!");
    } else {
      alert("Error adding product");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto bg-white p-6 shadow-lg rounded-lg"
    >
      {/* Product Name */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">Product Name</label>
        <input
          {...register("name", { required: true })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter product name"
        />
      </div>

      {/* Price */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">Price</label>
        <input
          type="number"
          step="0.01"
          {...register("price", { required: true })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter price"
        />
      </div>

      {/* Stock */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">
          Stock Quantity
        </label>
        <input
          type="number"
          {...register("stock", { required: true })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter stock quantity"
        />
      </div>

      {/* Unit Selection */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">Unit</label>
        <Controller
          name="unit"
          control={control}
          defaultValue="PCS"
          render={({ field }) => (
            <select {...field} className="w-full px-3 py-2 border rounded-md">
              {UNIT_CHOICES.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      {/* Custom Unit Field (Shows Only If 'Other' is Selected) */}
      {selectedUnit === "OTHER" && (
        <div className="mb-4">
          <label className="block font-medium text-gray-700">Custom Unit</label>
          <input
            {...register("custom_unit", { required: true })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter custom unit (e.g., Dozen, Pack, etc.)"
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        Submit Product
      </button>
    </form>
  );
}
