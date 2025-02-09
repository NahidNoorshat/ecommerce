import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from "@tanstack/react-table";
import UserEditModal from "./UserEditModal";
import { useUserManagement } from "../../hooks/useUserManagement";

const UserList = ({ users, onEdit, onDelete }) => {
  const { handleSave } = useUserManagement();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSavedata = (updatedUser) => {
    handleSave(updatedUser);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const columns = [
    { accessorKey: "username", header: "Username" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "phone_number", header: "Phone Number" },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="p-4 border rounded-xl bg-white shadow-lg">
      <h3 className="text-xl font-bold mb-4">User List</h3>

      {/* Table for Desktop with Pagination */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-gray-800 text-left">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3 border-b">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
                <th className="p-3 border-b">Actions</th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-blue-50 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 border-r">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="p-3">
                  <button
                    onClick={() => handleEditClick(row.original)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(row.original.id)}
                    className="ml-2 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`px-4 py-2 text-sm border rounded ${
              !table.getCanPreviousPage()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            Previous
          </button>

          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`px-4 py-2 text-sm border rounded ${
              !table.getCanNextPage()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Cards for Mobile */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 border rounded-lg shadow-md bg-gray-50"
          >
            <p className="text-lg font-semibold">{user.username}</p>
            <p className="text-sm text-gray-700">{user.email}</p>
            <p
              className={`text-xs font-semibold px-2 py-1 rounded-lg w-fit ${
                user.role === "admin"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {user.role}
            </p>
            <p className="text-sm text-gray-700">
              Address: {user.address || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              Phone: {user.phone_number || "N/A"}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleEditClick(user)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <UserEditModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavedata}
      />
    </div>
  );
};

export default UserList;
