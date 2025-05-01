"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Container";
import DiscountBanner from "@/components/DiscountBanner";
import ProductGrid from "@/components/ProductGrid";
import { PRODUCTS_API } from "@/utils/config";
import axios from "axios";
import Loader from "@/components/Loader";
import PriceRangeFilter from "@/components/PriceRangeFilter";
import PaginationControls from "@/components/paginationscontrol/PaginationControls";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    current_page: 1,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${PRODUCTS_API}/products/?page=${page}`);
      setProducts(res.data.results);
      setPagination({
        next: res.data.next,
        previous: res.data.previous,
        current_page: res.data.current_page,
        total_pages: res.data.total_pages,
      });
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  if (loading) return <Loader />;

  return (
    <Container className="pb-10">
      <DiscountBanner />
      <div className="flex flex-col gap-6 mt-6">
        <PriceRangeFilter />
        {error ? (
          <p>{error}</p>
        ) : (
          <>
            <ProductGrid products={products} />
            <PaginationControls
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </Container>
  );
}
