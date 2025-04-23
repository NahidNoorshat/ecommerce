"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button"; // shadcn/ui Button
import { Input } from "@/components/ui/input"; // shadcn/ui Input
import { Label } from "@/components/ui/label"; // shadcn/ui Label

export default function UploadProducts() {
  const [message, setMessage] = useState("");
  const [unmatched, setUnmatched] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", event.target.csvFile.files[0]);
    const imageFiles = event.target.imageFiles.files;
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append("images", imageFiles[i]);
    }

    const response = await fetch("http://13.51.157.149/api/products/upload/", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    setMessage(result.message);
    setUnmatched(result.unmatched || []);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800">
        Upload CSV/Excel and Images
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="csvFile"
            className="text-sm font-medium text-gray-700"
          >
            CSV/Excel File
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
        <div className="space-y-2">
          <Label
            htmlFor="imageFiles"
            className="text-sm font-medium text-gray-700"
          >
            Images
          </Label>
          <Input
            id="imageFiles"
            type="file"
            name="imageFiles"
            accept="image/*"
            multiple
            required
            className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <Button type="submit" className="w-full">
          Upload
        </Button>
      </form>

      {/* Feedback Section */}
      {message && (
        <p className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
          {message}
        </p>
      )}
      {unmatched.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800">
            Unmatched Images
          </h3>
          <ul className="list-disc pl-5 text-sm text-gray-600">
            {unmatched.map((img, idx) => (
              <li key={idx}>{img}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
