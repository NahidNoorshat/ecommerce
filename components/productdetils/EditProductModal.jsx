"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRODUCTS_API } from "@/utils/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function EditProductModal({ product, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: product.name ?? "",
    price: product.price ?? "",
    stock: product.stock ?? "",
    category: product?.category?.name ?? "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${PRODUCTS_API}/products/${product.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });

      if (!res.ok) throw new Error("Failed to update product");

      toast.success("Product updated successfully!");
      onUpdate(); // Refresh the product list
      onClose(); // Close modal
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle>Edit Product</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
          />
          <Input
            label="Stock"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
          />
          <Input
            label="Category"
            name="category"
            value={formData.category}
            disabled
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>

        {/* Full Edit Redirect */}
        <Link
          href={`/dashboard/admin/product/edit/${product.id}`}
          className="text-blue-600 text-sm mt-2 block"
        >
          More Options (Go to Full Edit Page)
        </Link>
      </DialogContent>
    </Dialog>
  );
}
