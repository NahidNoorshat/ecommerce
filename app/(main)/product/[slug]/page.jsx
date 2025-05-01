"use client";

import AddToCartButton from "@/components/AddToCartButton";
import Container from "@/components/Container";
import PriceView from "@/components/PriceView";
import { PRODUCTS_API } from "@/utils/config";
import axios from "axios";
import Image from "next/image";
import { notFound } from "next/navigation";
import React, { useState, useEffect } from "react";
import { LuStar } from "react-icons/lu";
import { toast } from "sonner";

const ProductPage = ({ params: paramsPromise }) => {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const [attributesMap, setAttributesMap] = useState({});
  const params = React.use(paramsPromise);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, attributesRes] = await Promise.all([
          axios.get(`${PRODUCTS_API}/products/${params.slug}/`), // Changed to detail endpoint
          axios.get(`${PRODUCTS_API}/variant-attributes/`),
        ]);

        console.log("Product response:", productRes.data);

        const foundProduct = productRes.data;
        if (!foundProduct?.slug) {
          console.warn(`No product found for slug: ${params.slug}`);
          notFound();
        }

        // Map attributes
        const attrMap = {};
        attributesRes.data.forEach((attr) => {
          attrMap[attr.id] = attr.name;
        });
        setAttributesMap(attrMap);

        setProduct(foundProduct);

        // No auto-selection of default variant
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 404) {
          notFound();
        }
        setError("Failed to load product");
      }
    };

    fetchData();
  }, [params.slug]);

  if (!product && !error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  const variants = product.variants || [];

  const allImages = [
    ...(product.main_image ? [product.main_image] : []),
    ...(product.gallery_images || []),
    ...(product.has_variants
      ? variants.map((v, i) => ({ ...v, id: `variant-${i}` }))
      : []),
  ].filter((item) => item && item.image);

  console.log("All images:", allImages);
  console.log("Variants:", variants);

  const getVariantAttributes = () => {
    const attributeMap = {};
    variants.forEach((variant) => {
      variant.attributes.forEach((attr) => {
        if (attr.attribute && attr.value) {
          if (!attributeMap[attr.attribute]) {
            attributeMap[attr.attribute] = new Set();
          }
          attributeMap[attr.attribute].add(attr.value);
        }
      });
    });
    return attributeMap;
  };

  const findMatchingVariant = (selectedAttrs) => {
    return variants.find((variant) =>
      variant.attributes.every(
        (attr) => selectedAttrs[attr.attribute] === attr.value
      )
    );
  };

  const variantAttributes = getVariantAttributes();
  console.log("Variant attributes:", variantAttributes);

  const handleAttributeChange = (attribute, value) => {
    const newAttributes = { ...selectedAttributes, [attribute]: value };
    setSelectedAttributes(newAttributes);

    const newVariant = findMatchingVariant(newAttributes);
    if (newVariant) {
      setSelectedVariant(newVariant);
      if (newVariant.image) {
        setSelectedImage(newVariant.image);
      }
    } else {
      setSelectedVariant(null);
      setSelectedImage(null);
    }
  };

  const stockQuantity = selectedVariant?.stock ?? product?.stock ?? 0;

  return (
    <div>
      <Container className="flex flex-col md:flex-row gap-10 py-10">
        {/* Product Image */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="w-full aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative shadow-sm">
            <Image
              src={
                selectedImage ||
                selectedVariant?.image ||
                product.main_image?.image ||
                "/fallback-image.jpg"
              }
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-contain p-2"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {allImages.map((item, idx) => (
              <div
                key={item.id || `image-${idx}`}
                onClick={() => setSelectedImage(item.image)}
                className={`flex-shrink-0 w-20 h-20 border-2 rounded-md overflow-hidden cursor-pointer transition-all ${
                  selectedImage === item.image
                    ? "border-2 border-black"
                    : "border border-gray-300 hover:border-black"
                }`}
              >
                <Image
                  src={item.image}
                  alt={`${product.name}`}
                  width={80}
                  height={80}
                  sizes="80px"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <div>
            <p className="text-4xl font-bold mb-2">{product?.name}</p>
            <div className="flex items-center gap-2">
              <div className="text-lightText flex items-center gap-0.5 text-sm">
                {Array.from({ length: 5 }).map((_, index) => (
                  <LuStar
                    key={index}
                    fill={index < 4 ? "#fca99b" : "transparent"}
                    className={index < 4 ? "text-lightOrange" : "text-gray-500"}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-500">(25 reviews)</p>
            </div>
          </div>

          <PriceView
            originalPrice={
              selectedVariant?.original_price || product?.original_price
            }
            displayPrice={selectedVariant?.final_price || product?.final_price}
            discount={product?.discount}
            label={product?.label}
            className="text-lg font-bold"
          />

          {stockQuantity > 0 ? (
            <p className="bg-green-100 w-32 text-center text-green-600 text-sm py-2.5 font-semibold rounded-lg">
              In Stock ({stockQuantity})
            </p>
          ) : (
            <p className="bg-red-100 w-32 text-center text-red-600 text-sm py-2.5 font-semibold rounded-lg">
              Out of Stock ({stockQuantity})
            </p>
          )}

          <p className="text-sm text-gray-600 tracking-wide">
            {product?.description}
          </p>

          {/* Variant Selection */}
          {product.has_variants && variants.length > 0 && (
            <div className="flex flex-col gap-4 mt-6">
              <p className="text-lg font-semibold">Select Variant:</p>

              {Object.entries(variantAttributes).map(
                ([attributeId, values]) => (
                  <div key={attributeId} className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-700">
                      {attributesMap[attributeId] || attributeId}:
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {Array.from(values).map((value) => {
                        const isSelected =
                          selectedAttributes[attributeId] === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              handleAttributeChange(attributeId, value)
                            }
                            className={`px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200 ${
                              isSelected
                                ? "bg-black text-white border-black"
                                : "bg-white text-black border-gray-300 hover:border-black"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Add to Cart Section */}
          {product.has_variants ? (
            selectedVariant ? (
              <AddToCartButton product={{ ...product, selectedVariant }} />
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                <button
                  type="button"
                  disabled
                  onClick={() =>
                    toast.error(
                      "Combination not available. Please change options."
                    )
                  }
                  className="w-full px-4 py-2 rounded-md bg-gray-300 text-gray-600 cursor-not-allowed"
                >
                  Select correct variant first
                </button>
              </div>
            )
          ) : (
            <AddToCartButton product={product} />
          )}
        </div>
      </Container>
    </div>
  );
};

export default ProductPage;
