"use client";

import AddToCartButton from "@/components/AddToCartButton";
import Container from "@/components/Container";
import PriceView from "@/components/PriceView";
import { PRODUCTS_API } from "@/utils/config";
import axios from "axios";
import Image from "next/image";
import { notFound } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { LuStar } from "react-icons/lu";
import { RxBorderSplit } from "react-icons/rx";
import { TbTruckDelivery } from "react-icons/tb";

const ProductPage = ({ params: paramsPromise }) => {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [error, setError] = useState(null);
  const [attributesMap, setAttributesMap] = useState({});

  const params = React.use(paramsPromise);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, attributesRes] = await Promise.all([
          axios.get(`${PRODUCTS_API}/products/`),
          axios.get(`${PRODUCTS_API}/variant-attributes/`),
        ]);
        const products = productsRes.data;
        const foundProduct = products.find((p) => p.slug === params.slug);
        if (!foundProduct) notFound();

        const attrMap = {};
        attributesRes.data.forEach((attr) => {
          attrMap[attr.id] = attr.name;
        });
        setAttributesMap(attrMap);

        setProduct(foundProduct);
        if (foundProduct.has_variants && foundProduct.variants.length > 0) {
          setSelectedVariant(foundProduct.variants[0]);
          const initialAttributes = {};
          foundProduct.variants[0].attributes.forEach((attr) => {
            initialAttributes[attr.attribute] = attr.value;
          });
          setSelectedAttributes(initialAttributes);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load products");
      }
    };
    fetchData();
  }, [params.slug]);

  if (!product && !error) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const variants = product.variants || [];
  const allImages = product.has_variants
    ? variants
    : [
        {
          id: "main",
          image: product.image,
          color: "Default",
          size: "",
          price: product.price,
          stock: product.stock,
        },
      ];

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

  const variantAttributes = getVariantAttributes();

  const handleAttributeChange = (attribute, value) => {
    const newAttributes = { ...selectedAttributes, [attribute]: value };
    setSelectedAttributes(newAttributes);

    const newVariant = variants.find((v) =>
      v.attributes.every((a) => newAttributes[a.attribute] === a.value)
    );
    setSelectedVariant(newVariant || variants[0]);
  };

  const stockQuantity = selectedVariant?.stock ?? product?.stock ?? 0; // Use nullish coalescing to handle undefined/null

  return (
    <div>
      <Container className="flex flex-col md:flex-row gap-10 py-10">
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="w-full h-auto border border-darkBlue/20 shadow-md rounded-md group overflow-hidden aspect-square">
            <Image
              src={selectedVariant?.image || product.image}
              alt={product.name}
              width={700}
              height={700}
              priority
              className="w-full h-full object-contain group-hover:scale-105 hoverEffect rounded-md"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {allImages.map(
              (item) =>
                item.image && (
                  <div
                    key={item.id}
                    onClick={() =>
                      setSelectedVariant(product.has_variants ? item : null)
                    }
                    className={`flex-shrink-0 w-20 h-20 border rounded-md overflow-hidden hover:border-darkBlue hoverEffect cursor-pointer ${
                      selectedVariant?.id === item.id ||
                      (!selectedVariant &&
                        item.id === "main" &&
                        !product.has_variants)
                        ? "border-darkBlue"
                        : "border-darkBlue/20"
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={`${product.name} - ${item.color || ""} ${
                        item.size || ""
                      }`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <div>
            <p className="text-4xl font-bold mb-2">{product?.name}</p>
            <div className="flex items-center gap-2">
              <div className="text-lightText flex items-center gap-.5 text-sm">
                {Array.from({ length: 5 }).map((_, index) => (
                  <LuStar
                    fill={index < 4 ? "#fca99b" : "transparent"}
                    key={index}
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

          <p className="text-base text-gray-800">
            <span className="bg-black text-white px-3 py-1 text-sm font-semibold rounded-md mr-2">
              20
            </span>
            People are viewing this right now
          </p>

          <p className="text-sm text-gray-600 tracking-wide">
            {product?.description}
          </p>

          {product.has_variants && variants.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-base font-semibold">Select Variant:</p>
              {Object.entries(variantAttributes).map(
                ([attributeId, values]) => (
                  <div key={attributeId} className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      {attributesMap[attributeId] || attributeId}:
                    </label>
                    <select
                      value={selectedAttributes[attributeId] || ""}
                      onChange={(e) =>
                        handleAttributeChange(attributeId, e.target.value)
                      }
                      className="border border-darkBlue/20 rounded-md p-2 hover:border-darkBlue focus:outline-none focus:ring-2 focus:ring-darkBlue"
                    >
                      <option value="">
                        Select {attributesMap[attributeId] || attributeId}
                      </option>
                      {Array.from(values).map((value) => {
                        const variant = variants.find((v) =>
                          v.attributes.some(
                            (a) =>
                              a.attribute === Number(attributeId) &&
                              a.value === value
                          )
                        );
                        const inStock = variant && variant.stock > 0;
                        return (
                          <option key={value} value={value} disabled={!inStock}>
                            {value} {inStock ? "" : "(Out of Stock)"}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )
              )}
            </div>
          )}

          <AddToCartButton product={{ ...product, selectedVariant }} />

          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-b-gray-200 py-5 -mt-2">
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
              <RxBorderSplit className="text-lg" />
              <p>Compare color</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
              <FaRegQuestionCircle className="text-lg" />
              <p>Ask a question</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
              <TbTruckDelivery className="text-lg" />
              <p>Delivery & Return</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
              <FiShare2 className="text-lg" />
              <p>Share</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <div className="border border-darkBlue/20 text-center p-3 hover:border-darkBlue hoverEffect rounded-md">
              <p className="text-base font-semibold text-black">
                Free Shipping
              </p>
              <p className="text-sm text-gray-500">
                Free shipping over order $120
              </p>
            </div>
            <div className="border border-darkBlue/20 text-center p-3 hover:border-darkBlue hoverEffect rounded-md">
              <p className="text-base font-semibold text-black">
                Flexible Payment
              </p>
              <p className="text-sm text-gray-500">
                Pay with Multiple Credit Cards
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductPage;
