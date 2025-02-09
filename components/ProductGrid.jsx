import React from "react";
import ProductList from "./ProductList";
import Image from "next/image";

// import Check from "../../ecommerce_images/back-2.jpg";
// import Check from "/ecommerce_images/back-2.jpg";

const ProductGrid = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 my-8">
      {products.map((product) => (
        <div key={product.id}>
          <ProductList product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
