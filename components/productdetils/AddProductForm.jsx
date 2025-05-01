"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PRODUCTS_API } from "@/utils/config";

const initialProductData = {
  name: "",
  description: "",
  price: "",
  discount: "0.00",
  stock: "",
  category: "",
  unit: "PCS",
  custom_unit: "",
  label: "",
  status: "NEW",
  has_variants: false,
  variants: [],
};

const VariantForm = ({
  index,
  variant,
  attributes,
  attributeValues,
  onChange,
  onRemove,
  preview,
}) => {
  return (
    <div className="mb-4 border p-4 rounded-lg">
      <h4 className="text-md font-semibold mb-2">Variant #{index + 1}</h4>
      <div className="grid grid-cols-2 gap-4">
        {attributes.map((attr) => {
          const filteredValues = attributeValues.filter(
            (val) => (val.attribute.id || val.attribute) === attr.id
          );
          return (
            <div key={attr.id}>
              <label
                htmlFor={`variant-${attr.id}-${index}`}
                className="block text-sm font-medium mb-2"
              >
                {attr.name}
              </label>
              <select
                id={`variant-${attr.id}-${index}`}
                name={attr.name}
                value={
                  variant.attributes.find((a) =>
                    filteredValues.some((v) => v.id === a)
                  ) || ""
                }
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  const updatedAttributes = variant.attributes.filter(
                    (id) => !filteredValues.some((v) => v.id === id)
                  );
                  if (value) updatedAttributes.push(value);
                  onChange(index, {
                    target: { name: "attributes", value: updatedAttributes },
                  });
                }}
                className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                required
              >
                <option value="">Select {attr.name}</option>
                {filteredValues.map((val) => (
                  <option key={val.id} value={val.id}>
                    {val.value}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        <div>
          <label
            htmlFor={`variant-price-${index}`}
            className="block text-sm font-medium mb-2"
          >
            Price
          </label>
          <input
            type="number"
            id={`variant-price-${index}`}
            name="price"
            value={variant.price}
            onChange={(e) => onChange(index, e)}
            className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div>
          <label
            htmlFor={`variant-stock-${index}`}
            className="block text-sm font-medium mb-2"
          >
            Stock
          </label>
          <input
            type="number"
            id={`variant-stock-${index}`}
            name="stock"
            value={variant.stock}
            onChange={(e) => onChange(index, e)}
            className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
            min="0"
            required
          />
        </div>
        <div>
          <label
            htmlFor={`variant-image-${index}`}
            className="block text-sm font-medium mb-2"
          >
            Image
          </label>
          <input
            type="file"
            id={`variant-image-${index}`}
            name="image"
            accept="image/*"
            onChange={(e) => onChange(index, e)}
            className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
          />
          {preview && (
            <img
              src={preview}
              alt="Variant Preview"
              className="mt-2 w-24 h-24 object-cover rounded"
            />
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="mt-2 text-red-600 hover:underline"
      >
        Remove Variant
      </button>
    </div>
  );
};

export default function AddProductForm() {
  const [productData, setProductData] = useState(initialProductData);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedImagePreviews, setUploadedImagePreviews] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [variantPreviews, setVariantPreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [variantAttributes, setVariantAttributes] = useState([]);
  const [variantAttributeValues, setVariantAttributeValues] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, attributesRes, valuesRes] = await Promise.all([
          axios.get(`${PRODUCTS_API}/categories/`),
          axios.get(`${PRODUCTS_API}/variant-attributes/`),
          axios.get(`${PRODUCTS_API}/variant-attribute-values/`),
        ]);
        setCategories(categoriesRes.data);
        setVariantAttributes(attributesRes.data);
        setVariantAttributeValues(valuesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load categories or variant options.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Clean up object URLs on unmount or image change
  useEffect(() => {
    return () => {
      uploadedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      variantPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [uploadedImagePreviews, variantPreviews]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB.`);
        return false;
      }
      return true;
    });

    // Clean up previous previews
    uploadedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setUploadedImages(validFiles);
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setUploadedImagePreviews(previews);
    setMainImageIndex(0); // Default to first image as main
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "has_variants" && !checked ? { variants: [] } : {}),
    }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value, files } = e.target;
    const updatedVariants = [...productData.variants];

    if (name === "image" && files && files[0]) {
      if (
        !files[0].type.startsWith("image/") ||
        files[0].size > 5 * 1024 * 1024
      ) {
        toast.error("Please upload a valid image (max 5MB).");
        return;
      }
      updatedVariants[index][name] = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariantPreviews((prev) => {
          const newPreviews = [...prev];
          newPreviews[index] = reader.result;
          return newPreviews;
        });
      };
      reader.readAsDataURL(files[0]);
    } else if (name === "attributes") {
      updatedVariants[index].attributes = value;
    } else {
      updatedVariants[index][name] =
        name === "stock" ? parseInt(value, 10) || "" : value;
    }

    setProductData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const handleAddVariant = () => {
    setProductData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { attributes: [], stock: "", price: "", image: null },
      ],
    }));
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = productData.variants.filter((_, i) => i !== index);
    const updatedPreviews = variantPreviews.filter((_, i) => i !== index);
    setProductData((prev) => ({ ...prev, variants: updatedVariants }));
    setVariantPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (
      !productData.name ||
      !productData.description ||
      !productData.category
    ) {
      toast.error("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (productData.has_variants) {
      if (productData.variants.length === 0) {
        toast.error(
          "At least one variant is required when variants are enabled."
        );
        setIsSubmitting(false);
        return;
      }
      for (const variant of productData.variants) {
        if (
          !variant.stock ||
          !variant.price ||
          variant.attributes.length === 0
        ) {
          toast.error(
            "All variant fields (stock, price, attributes) must be filled."
          );
          setIsSubmitting(false);
          return;
        }
      }
    } else if (!productData.price || !productData.stock) {
      toast.error(
        "Price and stock are required for products without variants."
      );
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("category", productData.category);
    formData.append("unit", productData.unit);
    formData.append(
      "custom_unit",
      productData.unit === "OTHER" ? productData.custom_unit : ""
    );
    formData.append("status", productData.status);
    formData.append("label", productData.label || "");
    formData.append("discount", productData.discount || "0.00");
    formData.append("has_variants", productData.has_variants.toString());

    if (!productData.has_variants) {
      formData.append("price", productData.price.toString());
      formData.append("stock", productData.stock.toString());
    }

    // Append multiple images
    uploadedImages.forEach((img) => formData.append("uploaded_images", img));
    formData.append("main_image_index", mainImageIndex.toString());

    if (productData.has_variants && productData.variants.length > 0) {
      const variantsData = productData.variants.map((variant) => ({
        attributes: variant.attributes,
        stock: parseInt(variant.stock),
        price: variant.price.toString(),
      }));
      formData.append("data", JSON.stringify({ variants: variantsData }));
      productData.variants.forEach((variant, index) => {
        if (variant.image) {
          formData.append(`variants[${index}][image]`, variant.image);
        }
      });
    }

    // Debugging: Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await axios.post(`${PRODUCTS_API}/products/`, formData);
      console.log("Response:", response.data);
      toast.success("Product added successfully!");
      setProductData(initialProductData);
      setUploadedImages([]);
      setUploadedImagePreviews([]);
      setMainImageIndex(0);
      setVariantPreviews([]);
    } catch (error) {
      console.error("Error:", error);
      const errorMsg =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).join(", ") ||
        error.message ||
        "Unknown error";
      toast.error(`Error adding product: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-white flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-semibold mb-6">Add Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={productData.name}
              onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
              rows="4"
              required
            />
          </div>
          {!productData.has_variants && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium mb-2"
                >
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={productData.price}
                  onChange={handleChange}
                  className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium mb-2"
                >
                  Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={productData.stock}
                  onChange={handleChange}
                  className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                  min="0"
                  required
                />
              </div>
            </>
          )}
          <div className="mb-4">
            <label
              htmlFor="discount"
              className="block text-sm font-medium mb-2"
            >
              Discount (%)
            </label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={productData.discount}
              onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
              step="0.01"
              min="0"
              max="100"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="label" className="block text-sm font-medium mb-2">
              Label
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={productData.label}
              onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="unit" className="block text-sm font-medium mb-2">
              Product Unit
            </label>
            <select
              id="unit"
              name="unit"
              value={productData.unit}
              onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
              required
            >
              <option value="PCS">Pieces</option>
              <option value="KG">Kilogram</option>
              <option value="L">Liter</option>
              <option value="M">Meter</option>
              <option value="G">Gram</option>
              <option value="BOX">Box</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          {productData.unit === "OTHER" && (
            <div className="mb-4">
              <label
                htmlFor="custom_unit"
                className="block text-sm font-medium mb-2"
              >
                Custom Unit
              </label>
              <input
                type="text"
                id="custom_unit"
                name="custom_unit"
                value={productData.custom_unit}
                onChange={handleChange}
                className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Product Status
            </label>
            <select
              id="status"
              name="status"
              value={productData.status}
              onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
              required
            >
              <option value="NEW">New</option>
              <option value="HOT">Hot</option>
              <option value="SALE">On Sale</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-2"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={productData.category}
              onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
              required
            >
              <option value="">Select a Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="has_variants"
                checked={productData.has_variants}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm font-medium">
                This product has variants
              </span>
            </label>
          </div>
          <div className="mb-4">
            <label
              htmlFor="uploaded_images"
              className="block text-sm font-medium mb-2"
            >
              Product Images (Select multiple)
            </label>
            <input
              type="file"
              id="uploaded_images"
              name="uploaded_images"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <div className="flex flex-wrap gap-4 mt-4">
              {uploadedImagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className={`w-24 h-24 object-cover rounded ${
                      index === mainImageIndex ? "border-4 border-blue-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setMainImageIndex(index)}
                    className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-1 py-0.5 rounded-bl-lg"
                  >
                    {index === mainImageIndex ? "Main" : "Set Main"}
                  </button>
                </div>
              ))}
            </div>
          </div>
          {productData.has_variants && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Product Variants</h3>
              {productData.variants.map((variant, index) => (
                <VariantForm
                  key={index}
                  index={index}
                  variant={variant}
                  attributes={variantAttributes}
                  attributeValues={variantAttributeValues}
                  onChange={handleVariantChange}
                  onRemove={handleRemoveVariant}
                  preview={variantPreviews[index]}
                />
              ))}
              <button
                type="button"
                onClick={handleAddVariant}
                className="py-2 px-4 bg-green-600 text-white rounded-lg mt-2"
              >
                Add Variant
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg shadow-md disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
