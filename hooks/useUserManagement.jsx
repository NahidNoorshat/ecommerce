import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import secureAxios from "@/lib/api/secureAxios";

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await secureAxios.get("/users/users/");
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error fetching users.");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (newUser) => {
    try {
      const formData = new FormData();
      Object.keys(newUser).forEach((key) => {
        if (newUser[key] !== null) {
          formData.append(key, newUser[key]);
        }
      });

      await secureAxios.post("/users/users/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchUsers();
      return { success: true };
    } catch (error) {
      if (error.response?.status === 400) {
        return { success: false, errors: error.response.data };
      }
      setError("Error adding user.");
      return {
        success: false,
        errors: { general: "An unexpected error occurred." },
      };
    }
  };

  const handleDelete = async (userId) => {
    try {
      await secureAxios.delete(`/users/users/${userId}/`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Error deleting user.");
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  const handleSave = async (updatedUser) => {
    try {
      const response = await secureAxios.patch(
        `/users/users/${updatedUser.id}/`,
        updatedUser
      );

      setUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? response.data : user))
      );

      setIsEditing(false);
      setSelectedUser(null);
      setError(null);
      return response.data;
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response?.data || error.message
      );
      setError("Error updating user.");
    }
  };

  return {
    users,
    setUsers,
    selectedUser,
    isEditing,
    error,
    handleDelete,
    handleEdit,
    handleSave,
    addUser,
    setSelectedUser,
    fetchUsers,
  };
};
