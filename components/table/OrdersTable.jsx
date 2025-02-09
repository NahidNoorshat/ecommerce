// components/OrdersTable.js
import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

const OrdersTable = ({ data }) => {
  // Define columns for the table
  const columns = [
    {
      header: "Order ID",
      accessorKey: "id",
    },
    {
      header: "Customer Name",
      accessorKey: "customerName",
    },
    {
      header: "Order Date",
      accessorKey: "orderDate",
      // Hide on small screens
      cell: (info) => (
        <span className="hidden sm:table-cell">{info.getValue()}</span>
      ),
    },
    {
      header: "Total Amount",
      accessorKey: "totalAmount",
      // Hide on small screens
      cell: (info) => (
        <span className="hidden sm:table-cell">{info.getValue()}</span>
      ),
    },
    {
      header: "Payment Status",
      accessorKey: "paymentStatus",
      cell: (info) => (
        <span
          className={`px-2 py-1 text-sm rounded ${
            info.getValue() === "Paid"
              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
              : info.getValue() === "Pending"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          }`}
        >
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Order Status",
      accessorKey: "orderStatus",
      cell: (info) => (
        <span
          className={`px-2 py-1 text-sm rounded ${
            info.getValue() === "Delivered"
              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
              : info.getValue() === "Processing"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          }`}
        >
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: () => (
        <div className="flex space-x-2">
          <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            View
          </button>
          <button className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300">
            Edit
          </button>
          <button className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
            Cancel
          </button>
        </div>
      ),
    },
  ];

  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      {/* Table Layout (Visible on sm and larger screens) */}

      <div className="hidden sm:block">
        <div className=" overflow-hidden rounded-xl ">
          {/* Updated container */}
          <div className="min-w-[600px] w-full">
            {/* Ensure the table has a minimum width */}
            <table className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl ">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="bg-gray-100 dark:bg-gray-700"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-medium text-gray-700 dark:text-gray-200 ${
                          // Hide certain headers on small screens
                          header.column.id === "orderDate" ||
                          header.column.id === "totalAmount"
                            ? "hidden sm:table-cell"
                            : ""
                        }`}
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
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`py-2 px-4 border-b  border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 ${
                          // Hide certain cells on small screens
                          cell.column.id === "orderDate" ||
                          cell.column.id === "totalAmount"
                            ? "hidden sm:table-cell"
                            : ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-200">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Card Layout (Visible on small screens) */}
      <div className="sm:hidden">
        {data.map((order) => (
          <div
            key={order.id}
            className="p-4 mb-4 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <div className="text-sm text-gray-700 dark:text-gray-200">
              <div className="font-medium">Order ID: {order.id}</div>
              <div>Customer: {order.customerName}</div>
              <div>Status: {order.orderStatus}</div>
              <div className="flex space-x-2 mt-2">
                <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  View
                </button>
                <button className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300">
                  Edit
                </button>
                <button className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersTable;
