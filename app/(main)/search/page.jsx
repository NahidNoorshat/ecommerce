"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import { PRODUCTS_API } from "@/utils/config";
import ProductList from "@/components/ProductList";
import Loader from "@/components/Loader";

const SearchPage = () => {
  const searchParams = useSearchParams();

  // ✅ Get all filter values from URL
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [query, category, minPrice, maxPrice]); // ✅ include price in dependencies

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${PRODUCTS_API}/products/`;
      const params = new URLSearchParams();

      if (query.trim()) params.set("search", query);
      if (category.trim()) params.set("category", category);
      if (minPrice.trim()) params.set("min_price", minPrice);
      if (maxPrice.trim()) params.set("max_price", maxPrice);

      if (Array.from(params).length > 0) {
        url += `?${params.toString()}`;
      }

      const res = await axios.get(url);
      setProducts(res.data.results || res.data); // supports paginated or non-paginated
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold mb-6">
        {query
          ? `Search Results for "${query}"`
          : category
          ? "Filtered Products"
          : "All Products"}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductList key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No products found.</p>
      )}
    </Container>
  );
};

export default SearchPage;
