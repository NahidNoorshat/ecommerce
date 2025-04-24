import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import secureAxios from "@/lib/api/secureAxios";

import DefaultAvatar from "../../public/useradmin.jpg";
import Image from "next/image";

export default function UserTable() {
  const { users, setUsers } = useUserManagement();
  const router = useRouter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 13;

  // Calculate Pagination
  const totalPages = Math.ceil(users.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await secureAxios.delete(`/users/users/${id}/`);

      if (response.status === 204) {
        setUsers(users.filter((user) => user.id !== id));
        toast.success("User deleted successfully");
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error.message);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleEditClick = (id) => {
    router.push(`/dashboard/admin/users/edit/${id}`);
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Profile</th>
                <th className="p-2 text-left">Username</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Address</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-left">Validated</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-2">
                    <div className="w-10 h-10 relative">
                      <Image
                        src={user?.profile_picture || DefaultAvatar}
                        alt={user.username}
                        fill // Makes the image fill the div
                        className="rounded-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">{user.address}</td>
                  <td className="p-2">{user.phone_number}</td>
                  <td className="p-2">
                    <Checkbox checked={user.is_active} disabled />
                  </td>
                  <td className="p-2">
                    <Checkbox checked={user.is_verified} disabled />
                  </td>
                  <td className="p-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(user.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {currentUsers.map((user) => (
            <Card key={user.id} className="border p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 relative">
                    <Image
                      src={user?.profile_picture || DefaultAvatar}
                      alt={user.username}
                      fill // Makes the image fill the div
                      className="rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">{user.username}</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(user.id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm">{user.role}</p>
              <p className="text-sm">{user.address}</p>
              <p className="text-sm">{user.phone_number}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm">Active:</span>
                <Checkbox checked={user.is_active} disabled />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Validated:</span>
                <Checkbox checked={user.is_verified} disabled />
              </div>
            </Card>
          ))}
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
