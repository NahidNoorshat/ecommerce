import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

export default function CategorySelector({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    // Fetch categories from API
    axios
      .get("/api/categories/")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const onSubmit = (data) => {
    if (useCustomCategory && newCategory) {
      // Send new category to API
      axios
        .post("/api/categories/", { name: newCategory })
        .then((response) => onCategorySelect(response.data.id))
        .catch((error) => console.error("Error adding category:", error));
    } else {
      onCategorySelect(data.category);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!useCustomCategory ? (
        <>
          <label>Select Category:</label>
          <select {...register("category")} className="border p-2">
            <option value="">Choose a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <label>New Category Name:</label>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border p-2"
            placeholder="Enter category name"
          />
        </>
      )}

      <button
        type="button"
        onClick={() => setUseCustomCategory(!useCustomCategory)}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {useCustomCategory ? "Select Existing" : "Add New Category"}
      </button>

      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Submit
      </button>
    </form>
  );
}
