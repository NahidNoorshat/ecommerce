"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { PRODUCTS_API } from "@/utils/config";
import Image from "next/image";
import EditProductModal from "./EditProductModal";
import Loader from "../Loader";
import { toast } from "sonner";
import Defoult_Image from "../../public/ecommerce_images/back-5.jpg";
import { getStockBadge } from "@/utils/getStockBadge";
import ProductSkeletonRow from "../lazyloading/ProductSkeletonRow";

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const productsPerPage = 10;
  const [sortKey, setSortKey] = useState(null); // 'stock' or 'price'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [stockFilter, setStockFilter] = useState("all"); // 'all', 'low', 'out'

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${PRODUCTS_API}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${PRODUCTS_API}/categories/`);
      const data = await res.json();
      console.log(data, "the cetegory i fetch ***************");
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`${PRODUCTS_API}/products/${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts(products.filter((product) => product.id !== id));
      toast.success("Product deleted successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = async () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    await fetchProducts();
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBulkDelete = async () => {
    if (!window.confirm("Are you sure you want to delete selected products?"))
      return;

    try {
      const res = await fetch(`${PRODUCTS_API}/bulk-delete/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProductIds }),
      });

      if (!res.ok) throw new Error("Bulk delete failed");

      toast.success("Selected products deleted!");
      setSelectedProductIds([]);
      await fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredProducts = products
    // 🔍 Search
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // 📦 Stock filter
    .filter((product) => {
      if (stockFilter === "low")
        return product.stock > 0 && product.stock <= 10;
      if (stockFilter === "out") return product.stock === 0;
      return true;
    })

    // 🏷️ Category filter
    .filter((product) => {
      if (categoryFilter === "all") return true;
      return product.category?.id === parseInt(categoryFilter);
    })

    // 🚩 Status filter
    .filter((product) => {
      if (statusFilter === "all") return true;
      return product.status?.toLowerCase() === statusFilter;
    })

    // 🔃 Sorting
    .sort((a, b) => {
      if (!sortKey) return 0;
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  if (loading) {
    return (
      <Card className="p-4">
        <div className="hidden md:block">
          <Table>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductSkeletonRow key={i} />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Skeletons for mobile cards */}
        <div className="block md:hidden space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded shadow bg-gray-100 dark:bg-gray-800 animate-pulse space-y-2"
            >
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;
  if (!loading && !error && filteredProducts.length === 0) {
    return (
      <Card className="p-4 text-center space-y-4">
        <p className="text-gray-500">No products matched your filters.</p>
        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("");
            setStockFilter("all");
            setCategoryFilter("all");
            setStatusFilter("all");
            setSortKey(null);
            setSortOrder("asc");
            setCurrentPage(1);
          }}
        >
          Reset Filters
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-4">
        {/* Left: Search + Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <Input
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="featured">Featured</option>
            <option value="sale">Sale</option>
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="all">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        {/* Right: Sorting + Delete */}
        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
          {/* Delete Selected */}
          {selectedProductIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete Selected ({selectedProductIds.length})
            </Button>
          )}

          {/* Sorting */}
          <Button
            variant="outline"
            onClick={() => {
              setSortKey("price");
              setSortOrder((prev) =>
                sortKey === "price" && prev === "asc" ? "desc" : "asc"
              );
            }}
          >
            Sort by Price{" "}
            {sortKey === "price" && (sortOrder === "asc" ? "↑" : "↓")}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setSortKey("stock");
              setSortOrder((prev) =>
                sortKey === "stock" && prev === "asc" ? "desc" : "asc"
              );
            }}
          >
            Sort by Stock{" "}
            {sortKey === "stock" && (sortOrder === "asc" ? "↑" : "↓")}
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md overflow-hidden bg-white dark:bg-slate-900">
        <Table className="w-full text-sm text-gray-800 dark:text-gray-200">
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={
                    currentProducts.length > 0 &&
                    currentProducts.every((product) =>
                      selectedProductIds.includes(product.id)
                    )
                  }
                  onChange={() => {
                    const allIds = currentProducts.map((p) => p.id);
                    const isAllSelected = allIds.every((id) =>
                      selectedProductIds.includes(id)
                    );

                    if (isAllSelected) {
                      setSelectedProductIds((prev) =>
                        prev.filter((id) => !allIds.includes(id))
                      );
                    } else {
                      const newIds = allIds.filter(
                        (id) => !selectedProductIds.includes(id)
                      );
                      setSelectedProductIds((prev) => [...prev, ...newIds]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProducts.map((product) => (
              <React.Fragment key={product.id}>
                <TableRow className="odd:bg-gray-50 even:bg-white dark:odd:bg-slate-800 dark:even:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds((prev) => [
                            ...prev,
                            product.id,
                          ]);
                        } else {
                          setSelectedProductIds((prev) =>
                            prev.filter((id) => id !== product.id)
                          );
                        }
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="relative w-16 h-16">
                      <Image
                        src={product.image || Defoult_Image} // Use default if no image
                        alt={product.name}
                        fill
                        className="rounded-md object-cover"
                        onError={(e) => (e.target.src = Defoult_Image)} // Fallback on error
                      />
                    </div>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        getStockBadge(product.stock).color
                      }`}
                    >
                      {getStockBadge(product.stock).label} ({product.stock})
                    </span>
                  </TableCell>

                  <TableCell
                    className="max-w-[150px] truncate overflow-hidden text-ellipsis whitespace-nowrap"
                    title={product.description}
                  >
                    {product.description}
                  </TableCell>
                  <TableCell className="flex gap-2 items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? (
                        "Deleting..."
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                    {product.has_variants && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleRow(product.id)}
                      >
                        {expandedRows[product.id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {expandedRows[product.id] && product.variants?.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-gray-50">
                      <div className="p-2">
                        <h4 className="text-sm font-medium">Variants:</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                          {product.variants.map((variant) => (
                            <li
                              key={variant.id}
                              className="flex items-center gap-2"
                            >
                              <span>
                                {variant.size} / {variant.color} - $
                                {variant.price} (Stock: {variant.stock})
                              </span>
                              <div className="relative w-8 h-8">
                                <Image
                                  src={variant.image || Defoult_Image} // Use default if no variant image
                                  alt={`${variant.size}-${variant.color}`}
                                  fill
                                  className="rounded-sm object-cover"
                                  onError={(e) =>
                                    (e.target.src = Defoult_Image)
                                  } // Fallback on error
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {currentProducts.map((product) => (
          <Card key={product.id} className="p-4 shadow-md">
            <div className="flex gap-4">
              <div className="relative w-20 h-20">
                <Image
                  src={product.image || Defoult_Image} // Use default if no image
                  alt={product.name}
                  fill
                  className="rounded-md object-cover"
                  onError={(e) => (e.target.src = Defoult_Image)} // Fallback on error
                />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-700">${product.price}</p>
                <p
                  className={`text-xs font-medium inline-block px-2 py-0.5 rounded-full mt-1 ${
                    getStockBadge(product.stock).color
                  }`}
                >
                  {getStockBadge(product.stock).label} ({product.stock})
                </p>

                <p className="text-xs text-gray-500 line-clamp-2">
                  {product.description}
                </p>
                {product.has_variants && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(product.id)}
                      className="flex items-center gap-1"
                    >
                      {expandedRows[product.id]
                        ? "Hide Variants"
                        : "Show Variants"}
                      {expandedRows[product.id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    {expandedRows[product.id] &&
                      product.variants?.length > 0 && (
                        <ul className="list-disc pl-5 text-xs text-gray-600 mt-2">
                          {product.variants.map((variant) => (
                            <li
                              key={variant.id}
                              className="flex items-center gap-2"
                            >
                              <span>
                                {variant.size} / {variant.color} - $
                                {variant.price} (Stock: {variant.stock})
                              </span>
                              <div className="relative w-6 h-6">
                                <Image
                                  src={variant.image || Defoult_Image} // Use default if no variant image
                                  alt={`${variant.size}-${variant.color}`}
                                  fill
                                  className="rounded-sm object-cover"
                                  onError={(e) =>
                                    (e.target.src = Defoult_Image)
                                  } // Fallback on error
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <EditProductModal
          product={selectedProduct}
          onClose={closeModal}
          onUpdate={fetchProducts}
        />
      )}

      <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {/* Page number buttons */}
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
              className="px-3"
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>

        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Showing page {currentPage} of {totalPages}
        </span>
      </div>
    </Card>
  );
}
