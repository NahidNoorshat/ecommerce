"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Container";
import DiscountBanner from "@/components/DiscountBanner";
import ProductGrid from "@/components/ProductGrid";
import { PRODUCTS_API } from "@/utils/config";
import axios from "axios";
import Loader from "@/components/Loader";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${PRODUCTS_API}/products/`);
        setProducts(response.data);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <Loader />;

  return (
    <Container>
      <DiscountBanner />
      {error ? <p>{error}</p> : <ProductGrid products={products} />}
    </Container>
  );
}
