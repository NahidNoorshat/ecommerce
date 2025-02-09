import React from "react";
import Link from "next/link";
import Image from "next/image";
import products from "../../../public/products.json"; // Ensure this path is correct
import Container from "@/components/Container";

const SearchPage = async ({ searchParams }) => {
  // Await `searchParams` before accessing its properties
  const query = (await searchParams)?.query || "";

  // Filter products based on the search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-gray-50 py-10">
      <Container>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Search Results for "{query}"
        </h1>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug.current}`} // Access `slug.current`
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg"
                    priority // Add priority for above-the-fold images
                  />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {product.name}
                </h2>
                <p className="text-gray-600">${product.price.toFixed(2)}</p>
                {product.stock > 0 ? (
                  <p className="text-sm text-green-600">In Stock</p>
                ) : (
                  <p className="text-sm text-red-600">Out of Stock</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No products found.</p>
        )}
      </Container>
    </div>
  );
};

export default SearchPage;
