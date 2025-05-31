"use client";

import AddToCartButton from "@/components/AddToCartButton";
import Container from "@/components/Container";
import PriceView from "@/components/PriceView";
import Loader from "@/components/Loader";
import { PRODUCTS_API } from "@/utils/config";
import axios from "axios";
import Image from "next/image";
import { notFound } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import useReviews from "@/hooks/useReviews";
import ProductReviews from "@/components/ProductReviews";
import ReviewForm from "@/components/ReviewForm";
import StarRatingDisplay from "@/components/StarRatingDisplay";
import { HiBadgeCheck } from "react-icons/hi";
import Modal from "@/components/Modal";
import ChatModal from "@/components/ChatModal";
import { useSelector } from "react-redux";

const ProductPage = ({ params: paramsPromise }) => {
  const user = useSelector((state) => state.user.user);
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const [attributesMap, setAttributesMap] = useState({});
  const params = React.use(paramsPromise);
  const [showVerification, setShowVerification] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, attributesRes] = await Promise.all([
          axios.get(`${PRODUCTS_API}/products/${params.slug}/`),
          axios.get(`${PRODUCTS_API}/variant-attributes/`),
        ]);

        const foundProduct = productRes.data;
        if (!foundProduct?.slug) return notFound();

        const attrMap = {};
        attributesRes.data.forEach((attr) => {
          attrMap[attr.id] = attr.name;
        });

        setAttributesMap(attrMap);
        setProduct(foundProduct);
      } catch (err) {
        if (err.response?.status === 404) return notFound();
        setError("Failed to load product");
      }
    };

    fetchData();
  }, [params.slug]);

  const {
    reviews,
    isLoading: reviewsLoading,
    isError: reviewsError,
    mutate,
  } = useReviews(product?.id || null);

  if (!product && !error) {
    return <Loader />;
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

  const getVariantAttributes = () => {
    const attributeMap = {};
    variants.forEach((variant) => {
      variant.attributes.forEach((attr) => {
        if (!attributeMap[attr.attribute])
          attributeMap[attr.attribute] = new Set();
        attributeMap[attr.attribute].add(attr.value);
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

  const handleAttributeChange = (attribute, value) => {
    const newAttributes = { ...selectedAttributes, [attribute]: value };
    setSelectedAttributes(newAttributes);

    const newVariant = findMatchingVariant(newAttributes);
    setSelectedVariant(newVariant || null);
    setSelectedImage(newVariant?.image || null);
  };

  const stockQuantity = selectedVariant?.stock ?? product?.stock ?? 0;

  // Generate roomId for ChatModal
  const roomId = user?.id
    ? `product_${product.id}_user_${user.id}`
    : `product_${product.id}_user_11`; // Fallback user ID

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
                    ? "border-black"
                    : "border-gray-300 hover:border-black"
                }`}
              >
                <Image
                  src={item.image}
                  alt={product.name}
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
              <StarRatingDisplay rating={product?.average_rating || 0} />
              <p className="text-sm font-medium text-gray-500">
                ({reviews?.length || 0} reviews)
              </p>
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

          <div className="flex items-center gap-4">
            <p
              className={`text-sm px-4 py-2.5 font-semibold rounded-lg ${
                stockQuantity > 0
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {stockQuantity > 0
                ? `In Stock (${stockQuantity})`
                : `Out of Stock (${stockQuantity})`}
            </p>

            {product.is_verified && (
              <button
                onClick={() => setShowVerification(true)}
                className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-2 rounded-full shadow hover:bg-blue-200 transition"
              >
                <HiBadgeCheck className="w-4 h-4 text-blue-600" />
                Verified
              </button>
            )}
          </div>
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
            )
          ) : (
            <AddToCartButton product={product} />
          )}
          <button
            onClick={() => setShowChat(true)}
            className="w-full px-4 py-2 rounded-md bg-blue-600 text-white font-medium mt-2 hover:bg-blue-700 transition"
          >
            💬 Message Seller
          </button>

          {/* Reviews */}
          <div className="max-w-3xl mt-12 border-t pt-8">
            <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

            {reviewsLoading && (
              <p className="text-gray-500">Loading reviews...</p>
            )}
            {reviewsError && (
              <p className="text-red-500">Failed to load reviews.</p>
            )}

            {!reviewsLoading && !reviewsError && (
              <>
                <ProductReviews productId={product.id} />
                <ReviewForm
                  productId={product.id}
                  userToken={
                    typeof window !== "undefined"
                      ? localStorage.getItem("token")
                      : null
                  }
                  mutate={mutate}
                />
              </>
            )}
          </div>
        </div>
        {showVerification && (
          <Modal onClose={() => setShowVerification(false)}>
            <div className="p-4">
              <h3 className="text-lg font-bold mb-3 text-blue-700 flex items-center gap-2">
                <HiBadgeCheck className="w-5 h-5 text-blue-600" />
                Product Verification Details
              </h3>

              {product.certificate_description ? (
                <div
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{
                    __html: product.certificate_description,
                  }}
                />
              ) : (
                <p className="text-sm text-gray-600 italic">
                  No description provided.
                </p>
              )}

              {product.certificate_file && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-1">
                    Verification File:
                  </p>
                  {product.certificate_file.endsWith(".pdf") ? (
                    <a
                      href={product.certificate_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      View Certificate PDF
                    </a>
                  ) : (
                    <Image
                      src={product.certificate_file}
                      alt="Certificate"
                      width={300}
                      height={200}
                      className="rounded border mt-2"
                    />
                  )}
                </div>
              )}
            </div>
          </Modal>
        )}
        {showChat && (
          <ChatModal
            productId={product.id}
            roomId={roomId}
            onClose={() => setShowChat(false)}
          />
        )}
      </Container>
    </div>
  );
};

export default ProductPage;
