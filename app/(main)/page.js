import Container from "@/components/Container";
import DiscountBanner from "@/components/DiscountBanner";
import Image from "next/image";

import products from "../../public/products.json";
import ProductGrid from "@/components/ProductGrid";

export default async function Home() {
  return (
    <Container>
      <DiscountBanner />
      <ProductGrid products={products} />
    </Container>
  );
}
