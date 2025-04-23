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
    image: null,
    has_variants: false,
    variants: [],
  });
  const [imagePreview, setImagePreview] = useState("");
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
              const text = await res.text(); // Get raw response
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

        setFormData({
          name: productData.name,
          description: productData.description,
          category: productData.category, // Assuming ID from backend
          price: productData.price || "",
          stock: productData.stock || "",
          image: null,
          has_variants: productData.has_variants,
          variants: productData.variants.map((variant) => ({
            id: variant.id,
            attributes: variant.attributes,
            stock: variant.stock,
            price: variant.price,
            image: null,
            existingImage: variant.image,
          })),
        });
        setImagePreview(productData.image || "");
      } catch (err) {
        console.error("Fetch error:", err.message);
        toast.error(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "has_variants" && !checked ? { variants: [] } : {}),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setFormData({ ...formData, image: file });
    }
  };

  const handleVariantChange = (index, e) => {
    const { name, value, files } = e.target;
    const updatedVariants = [...formData.variants];

    if (name === "image" && files && files[0]) {
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
    const updatedProduct = new FormData();
    updatedProduct.append("name", formData.name);
    updatedProduct.append("description", formData.description);
    updatedProduct.append("category", formData.category);
    updatedProduct.append("has_variants", formData.has_variants.toString());

    if (!formData.has_variants) {
      updatedProduct.append("price", formData.price || "");
      updatedProduct.append("stock", formData.stock || "");
    }

    if (formData.image instanceof File) {
      updatedProduct.append("image", formData.image);
    }

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
    }
  };

  if (loading) return <Loader />;
  if (!product) return <p className="text-red-500">Product not found</p>;

  return (
    <Card className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-900 dark:text-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Form fields remain the same as in your previous message */}
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
            Product Image
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="block w-full text-sm border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          {imagePreview && (
            <div className="mt-2">
              <Image
                src={imagePreview}
                alt="Product Image"
                width={100}
                height={100}
                className="rounded-md object-cover"
              />
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
          >
            Update Product
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
