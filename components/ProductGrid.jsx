import React from "react";
import ProductList from "./ProductList";

const ProductGrid = React.memo(({ products }) => {
  console.log("Rendering ProductGrid, timestamp:", Date.now());

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 my-8">
      {products.map((product) => (
        <div key={product.id}>
          <ProductList product={product} />
        </div>
      ))}
    </div>
  );
});

export default ProductGrid;
