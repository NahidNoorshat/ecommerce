"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PRODUCTS_API } from "@/utils/config";
import Image from "next/image";
import { toast } from "sonner";
import Loader from "../Loader";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    has_variants: false,
    variants: [],
  });
  const [existingImages, setExistingImages] = useState([]); // [{ id, image, alt_text, is_main }]
  const [uploadedImages, setUploadedImages] = useState([]); // Array of File objects
  const [uploadedImagePreviews, setUploadedImagePreviews] = useState([]); // Array of preview URLs
  const [mainImageIndex, setMainImageIndex] = useState(0); // Index in combined images (existing + uploaded)
  const [imagesToDelete, setImagesToDelete] = useState([]); // IDs of existing images to delete
  const [categories, setCategories] = useState([]);
  const [variantAttributes, setVariantAttributes] = useState([]);
  const [variantAttributeValues, setVariantAttributeValues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urls = [
          `${PRODUCTS_API}/products/${id}/`,
          `${PRODUCTS_API}/categories/`,
          `${PRODUCTS_API}/variant-attributes/`,
          `${PRODUCTS_API}/variant-attribute-values/`,
        ];
        const responses = await Promise.all(
          urls.map(async (url) => {
            const res = await fetch(url);
            if (!res.ok) {
              const text = await res.text();
              throw new Error(
                `Failed to fetch ${url}: ${res.status} - ${text.slice(
                  0,
                  50
                )}...`
              );
            }
            return res.json();
          })
        );

        const [productData, categoriesData, attributesData, valuesData] =
          responses;

        setProduct(productData);
        setCategories(categoriesData);
        setVariantAttributes(attributesData);
        setVariantAttributeValues(valuesData);

        // Initialize form data
        setFormData({
          name: productData.name,
          description: productData.description,
          category: productData.category?.id || "",
          price: productData.price || "",
          stock: productData.stock || "",
          has_variants: productData.has_variants,
          variants: productData.variants.map((variant) => ({
            id: variant.id,
            attributes: variant.attributes.map((attr) => attr.id),
            stock: variant.stock,
            price: variant.price,
            image: null,
            existingImage: variant.image,
          })),
        });

        // Initialize existing images (main_image + gallery_images)
        const images = [
          ...(productData.main_image
            ? [{ ...productData.main_image, is_main: true }]
            : []),
          ...(productData.gallery_images || []),
        ];
        setExistingImages(images);
        // Set main image index to the main_image if it exists, else 0
        const mainIndex = images.findIndex((img) => img.is_main);
        setMainImageIndex(mainIndex >= 0 ? mainIndex : 0);
      } catch (err) {
        console.error("Fetch error:", err.message);
        toast.error(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();

    // Cleanup previews on unmount
    return () => {
      uploadedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "has_variants" && !checked ? { variants: [] } : {}),
    }));
  };

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
    // Set main image index to the first new image if uploaded, else keep existing
    if (validFiles.length > 0) {
      setMainImageIndex(existingImages.length);
    }
  };

  const handleRemoveExistingImage = (imageId) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    // Adjust mainImageIndex if the removed image was the main image
    if (existingImages.find((img) => img.id === imageId)?.is_main) {
      setMainImageIndex(0);
    }
  };

  const handleVariantChange = (index, e) => {
    const { name, value, files } = e.target;
    const updatedVariants = [...formData.variants];

    if (name === "image" && files && files[0]) {
      if (
        !files[0].type.startsWith("image/") ||
        files[0].size > 5 * 1024 * 1024
      ) {
        toast.error("Please upload a valid image (max 5MB).");
        return;
      }
      updatedVariants[index].image = files[0];
      updatedVariants[index].preview = URL.createObjectURL(files[0]);
    } else if (name === "attributes") {
      const attrId = parseInt(value, 10);
      const attrName = e.target.getAttribute("data-attr-name");
      const filteredValues = variantAttributeValues.filter(
        (val) =>
          (val.attribute.id || val.attribute) ===
          variantAttributes.find((a) => a.name === attrName).id
      );
      const currentAttrs = updatedVariants[index].attributes.filter(
        (id) => !filteredValues.some((v) => v.id === id)
      );
      if (attrId) currentAttrs.push(attrId);
      updatedVariants[index].attributes = currentAttrs;
    } else {
      updatedVariants[index][name] = value;
    }
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      has_variants: true,
      variants: [
        ...formData.variants,
        { attributes: [], stock: "", price: "", image: null, preview: null },
      ],
    });
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      has_variants: updatedVariants.length > 0,
      variants: updatedVariants,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.name || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (formData.has_variants) {
      if (formData.variants.length === 0) {
        toast.error(
          "At least one variant is required when variants are enabled."
        );
        setLoading(false);
        return;
      }
      for (const variant of formData.variants) {
        if (
          !variant.stock ||
          !variant.price ||
          variant.attributes.length === 0
        ) {
          toast.error(
            "All variant fields (stock, price, attributes) must be filled."
          );
          setLoading(false);
          return;
        }
      }
    } else if (!formData.price || !formData.stock) {
      toast.error(
        "Price and stock are required for products without variants."
      );
      setLoading(false);
      return;
    }

    const updatedProduct = new FormData();
    updatedProduct.append("name", formData.name);
    updatedProduct.append("description", formData.description);
    updatedProduct.append("category", formData.category);
    updatedProduct.append("has_variants", formData.has_variants.toString());

    if (!formData.has_variants) {
      updatedProduct.append("price", formData.price || "");
      updatedProduct.append("stock", formData.stock || "");
    }

    // Append images
    uploadedImages.forEach((img) =>
      updatedProduct.append("uploaded_images", img)
    );
    // Calculate main_image_index based on combined existing and uploaded images
    const totalExistingImages = existingImages.length;
    updatedProduct.append("main_image_index", mainImageIndex.toString());

    // Append images to delete (if supported by backend)
    if (imagesToDelete.length > 0) {
      updatedProduct.append("images_to_delete", JSON.stringify(imagesToDelete));
    }

    // Handle variants
    if (formData.has_variants && formData.variants.length > 0) {
      const variantsData = formData.variants.map((variant) => ({
        id: variant.id || null,
        attributes: variant.attributes,
        stock: variant.stock,
        price: variant.price,
      }));
      updatedProduct.append("data", JSON.stringify({ variants: variantsData }));

      formData.variants.forEach((variant, index) => {
        if (variant.image instanceof File) {
          updatedProduct.append(`variants[${index}][image]`, variant.image);
        }
      });
    }

    try {
      const res = await fetch(`${PRODUCTS_API}/products/${id}/`, {
        method: "PATCH",
        body: updatedProduct,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Update failed: ${res.status} - ${text.slice(0, 50)}...`
        );
      }

      toast.success("Product updated successfully!");
      router.push("/dashboard/admin/product/all");
    } catch (err) {
      console.error("Submit error:", err.message);
      toast.error(`Error updating product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return <p className="text-red-500">Product not found</p>;

  // Combine existing and uploaded images for display
  const allImages = [
    ...existingImages.map((img) => ({
      id: img.id,
      src: img.image,
      alt: img.alt_text,
      isExisting: true,
    })),
    ...uploadedImagePreviews.map((preview, index) => ({
      id: `new-${index}`,
      src: preview,
      alt: `New Image ${index + 1}`,
      isExisting: false,
    })),
  ];

  return (
    <Card className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-900 dark:text-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">
            Product Name
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">
            Description
          </label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
          >
            <option value="">Select a Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {!formData.has_variants && (
          <>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Price
              </label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Stock
              </label>
              <Input
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">
            Product Images (Select multiple)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*"
            className="block w-full text-sm border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          {allImages.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {allImages.map((image, index) => (
                <div key={image.id} className="relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={100}
                    height={100}
                    className={`rounded-md object-cover ${
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
                  {image.isExisting && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(image.id)}
                      className="absolute top-0 left-0 bg-red-600 text-white text-xs px-1 py-0.5 rounded-br-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="has_variants"
              checked={formData.has_variants}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm font-medium dark:text-gray-300">
              Has Variants
            </span>
          </label>
        </div>
        {formData.has_variants && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Variants</h3>
            {formData.variants.map((variant, index) => (
              <div
                key={index}
                className="border p-4 rounded mb-4 dark:border-gray-700"
              >
                <div className="grid grid-cols-2 gap-4">
                  {variantAttributes.map((attr) => {
                    const filteredValues = variantAttributeValues.filter(
                      (val) => (val.attribute.id || val.attribute) === attr.id
                    );
                    return (
                      <div key={attr.id}>
                        <label className="block text-sm font-medium dark:text-gray-300">
                          {attr.name}
                        </label>
                        <select
                          name="attributes"
                          data-attr-name={attr.name}
                          value={
                            variant.attributes.find((a) =>
                              filteredValues.some((v) => v.id === a)
                            ) || ""
                          }
                          onChange={(e) => handleVariantChange(index, e)}
                          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
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
                    <label className="block text-sm font-medium dark:text-gray-300">
                      Price
                    </label>
                    <Input
                      name="price"
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, e)}
                      required={formData.has_variants}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300">
                      Stock
                    </label>
                    <Input
                      name="stock"
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, e)}
                      required={formData.has_variants}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium dark:text-gray-300">
                      Variant Image
                    </label>
                    <input
                      type="file"
                      name="image"
                      onChange={(e) => handleVariantChange(index, e)}
                      accept="image/*"
                      className="block w-full text-sm border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    {(variant.preview || variant.existingImage) && (
                      <div className="mt-2">
                        <Image
                          src={variant.preview || variant.existingImage}
                          alt="Variant Image"
                          width={100}
                          height={100}
                          className="rounded-md object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveVariant(index)}
                  className="mt-2"
                >
                  Remove Variant
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={handleAddVariant}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              Add Variant
            </Button>
          </div>
        )}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="dark:bg-blue-600 dark:hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Product"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/admin/product/all")}
            className="dark:border-gray-600 dark:text-gray-300"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
