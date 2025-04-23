"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { PRODUCTS_API } from "@/utils/config";

export const useProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  // Memoize axios instance
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: PRODUCTS_API,
    });
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(() => {
    axiosInstance
      .get("/products/")
      .then((response) => {
        setProducts(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError("Error fetching products.");
      });
  }, [axiosInstance]);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add new product
  const addProduct = (newProduct) => {
    const formData = new FormData();
    Object.keys(newProduct).forEach((key) => {
      if (newProduct[key] !== null && newProduct[key] !== undefined) {
        formData.append(key, newProduct[key]);
      }
    });

    return axiosInstance
      .post("/products/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        fetchProducts();
        return { success: true };
      })
      .catch((error) => {
        console.error("Error adding product:", error);
        if (error.response?.status === 400) {
          return { success: false, errors: error.response.data };
        }
        setError("Error adding product.");
        return {
          success: false,
          errors: { general: "An unexpected error occurred." },
        };
      });
  };

  // Delete product
  const handleDelete = (productId) => {
    axiosInstance
      .delete(`/products/${productId}/`)
      .then(() => {
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productId)
        );
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
        setError("Error deleting product.");
      });
  };

  // Edit product
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditing(true);
  };

  // Save updated product
  const handleSave = (updatedProduct) => {
    if (!updatedProduct || !updatedProduct.id) {
      console.error("Invalid product data:", updatedProduct);
      setError("Invalid product data.");
      return;
    }

    axiosInstance
      .patch(`/products/${updatedProduct.id}/`, updatedProduct)
      .then((response) => {
        if (response.status !== 200) {
          throw new Error("Failed to update product");
        }
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === updatedProduct.id ? response.data : product
          )
        );
        setIsEditing(false);
        setSelectedProduct(null);
        setError(null);
        return response.data;
      })
      .catch((error) => {
        console.error(
          "Error updating product:",
          error.response?.data || error.message
        );
        setError("Error updating product.");
      });
  };

  return {
    products,
    setProducts,
    selectedProduct,
    isEditing,
    error,
    handleDelete,
    handleEdit,
    handleSave,
    addProduct,
    setSelectedProduct,
    fetchProducts,
  };
};
