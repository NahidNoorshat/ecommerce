"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // shadcn/ui Button
import { Input } from "@/components/ui/input"; // shadcn/ui Input
import { Label } from "@/components/ui/label"; // shadcn/ui Label
import { PRODUCTS_API } from "@/utils/config"; // Adjust path later if needed

export default function UploadProducts() {
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    const csvFile = event.target.csvFile.files[0];

    if (!csvFile) {
      setMessage("Please select a CSV or Excel file to upload.");
      return;
    }

    formData.append("file", csvFile);

    try {
      const response = await fetch(`${PRODUCTS_API}/bulk-upload/`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(
          `Successfully uploaded ${result.successfully_created} products!`
        );
        setErrors(result.errors || []);
      } else {
        setMessage("Upload failed. Please check your file and try again.");
        setErrors(result.errors || []);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Something went wrong while uploading.");
      setErrors([]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800">
        Bulk Upload Products
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="csvFile"
            className="text-sm font-medium text-gray-700"
          >
            CSV or Excel File
          </Label>
          <Input
            id="csvFile"
            type="file"
            name="csvFile"
            accept=".csv, .xlsx"
            required
            className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <Button type="submit" className="w-full">
          Upload Products
        </Button>
      </form>

      {/* Feedback Section */}
      {message && (
        <p className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
          {message}
        </p>
      )}

      {/* Error Report Section */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-red-700">
            Errors (Rows with issues):
          </h3>
          <ul className="list-disc pl-5 text-sm text-red-600">
            {errors.map((err, idx) => (
              <li key={idx}>
                Row {err.row_number}: {err.error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
