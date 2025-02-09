"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Checkbox, Button } from "@headlessui/react";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

const ProductTabledeepseek = ({ data, onEdit, onDelete }) => {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = React.useMemo(
    () => [
      {
        id: "selection",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        header: "Image",
        accessorKey: "image",
        cell: ({ getValue }) => (
          <img
            src={getValue()}
            alt="Product"
            className="w-10 h-10 rounded-full object-cover"
          />
        ),
      },
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Category",
        accessorKey: "category",
      },
      {
        header: "Price",
        accessorKey: "price",
        cell: ({ getValue }) => `$${getValue()}`,
      },
      {
        header: "Stock",
        accessorKey: "stock",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              getValue() === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {getValue()}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button
              onClick={() => onEdit(row.original)}
              className="p-2 text-blue-500 hover:text-blue-700"
            >
              <PencilIcon className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => onDelete(row.original)}
              className="p-2 text-red-500 hover:text-red-700"
            >
              <TrashIcon className="h-5 w-5" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-2 bg-gray-200 rounded-lg"
        >
          Previous
        </Button>
        <span>
          Page{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-2 bg-gray-200 rounded-lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ProductTabledeepseek;
