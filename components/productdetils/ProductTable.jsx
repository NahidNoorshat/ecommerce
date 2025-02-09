"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

const products = [
  { id: "1", image: "/product1.jpg", name: "Product 1", price: 29.99 },
  { id: "2", image: "/product2.jpg", name: "Product 2", price: 49.99 },
  { id: "3", image: "/product3.jpg", name: "Product 3", price: 19.99 },
];

export default function ProductTable() {
  const { theme, setTheme } = useTheme();
  const [data, setData] = useState(products);
  const [selectedRows, setSelectedRows] = useState({});

  const columns = [
    {
      id: "select",
      header: () => (
        <input
          type="checkbox"
          onChange={(e) => {
            const isChecked = e.target.checked;
            setSelectedRows(
              Object.fromEntries(data.map((row) => [row.id, isChecked]))
            );
          }}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={!!selectedRows[row.original.id]}
          onChange={() =>
            setSelectedRows((prev) => ({
              ...prev,
              [row.original.id]: !prev[row.original.id],
            }))
          }
        />
      ),
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.image}
          alt={row.original.name}
          className="h-10 w-10 rounded-md object-cover"
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <span>${row.original.price.toFixed(2)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              setData(data.filter((item) => item.id !== row.original.id))
            }
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="p-4 shadow-md dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Product List</h2>
        <Switch
          checked={theme === "dark"}
          onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-200 dark:bg-gray-800">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 border border-gray-300 dark:border-gray-700"
                  >
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
              <tr
                key={row.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="p-2 border border-gray-300 dark:border-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
