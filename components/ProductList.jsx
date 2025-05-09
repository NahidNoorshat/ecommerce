"use client";

import { LuStar } from "react-icons/lu";
import Image from "next/image";
import Link from "next/link";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";
import ProductCartBar from "./ProductCartBar";
import { getCategoryBreadcrumb } from "@/utils/categoryUtils";
import React from "react";

const ProductList = React.memo(({ product }) => {
  console.log(
    `Rendering ProductList for ${product.name}, timestamp: ${Date.now()}`
  );

  // Get lowest price from variants
  const getPriceFromVariant = (variant) => {
    if (!variant) return { original: null, final: null };
    return {
      original:
        variant.original_price === "Price not available"
          ? null
          : parseFloat(variant.original_price),
      final:
        variant.final_price === "Price not available"
          ? null
          : parseFloat(variant.final_price),
    };
  };

  const priceData = product.has_variants
    ? getPriceFromVariant(product.default_variant)
    : {
        original:
          product.original_price === "Price not available"
            ? null
            : parseFloat(product.original_price),
        final:
          product.final_price === "Price not available"
            ? null
            : parseFloat(product.final_price),
      };

  const priceLabel = product.has_variants ? "From" : product.label;

  const mainImage = product?.main_image?.image || null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden group text-sm">
      <div className="border-b border-b-gray-300 overflow-hidden relative">
        <div className="relative w-full pt-[100%] bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <Link href={`/product/${product.slug}`}>
            {mainImage && (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                loading="lazy"
                className="absolute top-0 left-0 w-full h-full object-cover object-top  transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </Link>
        </div>

        {product?.stock === 0 && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <p className="text-lg font-bold text-white">Out of Stock</p>
          </div>
        )}

        {product?.status && (
          <div className="absolute left-1 top-1 z-10 flex flex-col items-center space-y-1 text-gray-500 px-2 py-1 group-hover:opacity-0 transition-opacity duration-300">
            {product.status.split("").map((char, index) => (
              <span key={index} className="font-semibold uppercase">
                {char}
              </span>
            ))}
          </div>
        )}

        {product?.stock !== 0 && (
          <div className="absolute bottom-0 left-0 w-full translate-y-12 group-hover:-translate-y-4 hoverEffect">
            <ProductCartBar />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 font-medium">
            {getCategoryBreadcrumb(product?.category)}
          </p>

          <div className="text-lightText flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const isLastStar = index === 4;
              return (
                <LuStar
                  key={index}
                  className={isLastStar ? "text-gray-400" : "text-orange-400"}
                  fill={!isLastStar ? "#fca99b" : "transparent"}
                />
              );
            })}
          </div>
        </div>

        <p className="text-base text-gray-600 tracking-wide font-semibold line-clamp-1 capitalize">
          {product?.name}
        </p>

        <PriceView
          originalPrice={priceData.original}
          displayPrice={priceData.final}
          discount={product?.discount}
          label={priceLabel}
        />

        <AddToCartButton
          product={product}
          variant={product.has_variants ? product.default_variant : null}
        />
      </div>
    </div>
  );
});

export default ProductList;
