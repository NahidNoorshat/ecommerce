"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import axios from "axios";
import AddProductModal from "./AddProductModal";
import AddCategoryModal from "./AddCategoryModal";

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://13.51.157.149/api/products/products/"
      );
      setProducts(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const columns = [
    { header: "Name", accessorKey: "name" },
    {
      header: "Category",
      accessorKey: "category", // Use accessorKey for main field
      cell: ({ row }) => row.original.category_details?.name || "No Category", // Handle nested access
    },
    { header: "Price", accessorKey: "price" },
    { header: "Stock", accessorKey: "stock" },
    { header: "Unit", accessorKey: "unit" },
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>

      <div className="flex gap-2 mb-4">
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={() => setIsProductModalOpen(true)}
        >
          Add Product
        </button>

        <button
          className="bg-green-500 text-white p-2 rounded"
          onClick={() => setIsCategoryModalOpen(true)}
        >
          Add Category
        </button>
      </div>

      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-2 border">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2 border">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Product Modal */}
      {isProductModalOpen && (
        <AddProductModal
          onClose={() => setIsProductModalOpen(false)}
          refreshData={fetchProducts}
        />
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <AddCategoryModal
          onClose={() => setIsCategoryModalOpen(false)}
          refreshData={fetchProducts}
        />
      )}
    </div>
  );
}
