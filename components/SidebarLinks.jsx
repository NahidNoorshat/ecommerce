import { LayoutDashboard, ShoppingCart, Users, Package } from "lucide-react";

export const sidebarLinks = {
  admin: [
    { name: "Dashboard", path: "/dashboard/admin", icon: LayoutDashboard },
    {
      name: "Products",
      icon: ShoppingCart,
      subLinks: [
        { name: "All Products", path: "/dashboard/admin/product/all" },
        { name: "Add Product", path: "/dashboard/admin/product/add" },
        { name: "Manage Products", path: "/dashboard/admin/product/manage" },
      ],
    },
    {
      name: "Users",
      icon: Users,
      subLinks: [
        { name: "All Users", path: "/dashboard/admin/users/all" },
        { name: "User Roles", path: "/dashboard/admin/users/roles" },
      ],
    },
    {
      name: "Orders",
      icon: Package, // Using "Package" icon for Orders
      subLinks: [
        { name: "All Orders", path: "/dashboard/admin/orders/all" },
        { name: "Pending Orders", path: "/dashboard/admin/orders/pending" },
        {
          name: "Processing Orders",
          path: "/dashboard/admin/orders/processing",
        },
        { name: "Shipped Orders", path: "/dashboard/admin/orders/shipped" },
        { name: "Completed Orders", path: "/dashboard/admin/orders/completed" },
        { name: "Cancelled Orders", path: "/dashboard/admin/orders/cancelled" },
      ],
    },
  ],
  seller: [
    { name: "Dashboard", path: "/dashboard/seller", icon: LayoutDashboard },
    {
      name: "My Products",
      path: "/dashboard/seller/products",
      icon: ShoppingCart,
    },
  ],
  customer: [
    { name: "Dashboard", path: "/dashboard/customer", icon: LayoutDashboard },
    { name: "Orders", path: "/dashboard/customer/orders", icon: ShoppingCart },
  ],
};
